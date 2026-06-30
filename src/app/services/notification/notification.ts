import { Injectable, inject, signal, computed, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap, Subscription, interval } from 'rxjs';
import { Notification } from '../../models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private zone = inject(NgZone);

  private _open = signal(false);
  isOpen = this._open.asReadonly();

  private _notifications = signal<Notification[]>([]);
  notifications = this._notifications.asReadonly();

  private _loaded = signal(false);
  loaded = this._loaded.asReadonly();

  unreadCount = computed(() => this._notifications().filter(n => !n.isRead).length);
  hasNewNotifications = computed(() => this.unreadCount() > 0);

  private pollingSub?: Subscription;

  open() { this._open.set(true); this.markAsSeen(); }
  close() { this._open.set(false); }
  toggle() { const next = !this._open(); this._open.set(next); if (next) this.markAsSeen(); }

  startPolling(intervalMs: number = 5000) {
    if (this.pollingSub) return;
    this.pollingSub = interval(intervalMs).pipe(
      switchMap(() => this.http.get<Notification[]>('/api/notifications/me')),
      tap(data => this.zone.run(() => { this._notifications.set(data); this._loaded.set(true); }))
    ).subscribe();
  }

  stopPolling() {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
  }

  loadNotifications() {
    if (this._loaded()) return;
    this.http.get<Notification[]>('/api/notifications/me').pipe(
      tap(data => { this._notifications.set(data); this._loaded.set(true); })
    ).subscribe();
  }

  refresh() {
    this.http.get<Notification[]>('/api/notifications/me').pipe(
      tap(data => { this._notifications.set(data); this._loaded.set(true); })
    ).subscribe();
  }

  markAsRead(id: number) {
    this._notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
    return this.http.put(`/api/notifications/${id}/read`, {});
  }

  markAsSeen() {}
}