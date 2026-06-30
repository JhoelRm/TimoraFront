import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Notification } from '../../models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private http = inject(HttpClient);

  // =========================
  // UI STATE
  // =========================
  private _open = signal(false);
  isOpen = this._open.asReadonly();

  open() {
    this._open.set(true);
    this.markAsSeen();
  }

  close() {
    this._open.set(false);
  }

  toggle() {
    const next = !this._open();
    this._open.set(next);

    if (next) this.markAsSeen();
  }

  // =========================
  // DATA STATE
  // =========================
  private _notifications = signal<Notification[]>([]);
  notifications = this._notifications.asReadonly();

  private _loaded = signal(false);
  loaded = this._loaded.asReadonly();

  // =========================
  // DERIVED STATE (SOLO ESTO)
  // =========================

  unreadCount = computed(() =>
    this._notifications().filter(n => !n.isRead).length
  );

  hasNewNotifications = computed(() =>
    this.unreadCount() > 0
  );

  // =========================
  // POLLING
  // =========================
  private pollingInterval: any;

  startPolling(intervalMs: number = 5000) {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(() => {
      this.refresh();
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // =========================
  // LOAD / REFRESH
  // =========================
  loadNotifications() {
    if (this._loaded()) return;

    this.http.get<Notification[]>('/api/notifications/me')
      .pipe(
        tap(data => {
          this._notifications.set(data);
          this._loaded.set(true);
        })
      )
      .subscribe();
  }

  refresh() {
    this.http.get<Notification[]>('/api/notifications/me')
      .pipe(
        tap(data => {
          this._notifications.set(data);
          this._loaded.set(true);
        })
      )
      .subscribe();
  }

  // =========================
  // MARK AS READ
  // =========================
  markAsRead(id: number) {
    this._notifications.update(list =>
      list.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );

    return this.http.put(
      `/api/notifications/${id}/read`,
      {}
    );
  }

  // =========================
  // MARK AS SEEN
  // =========================
  markAsSeen() {
    // opcional (solo UI tracking si luego quieres badge avanzado)
  }
}