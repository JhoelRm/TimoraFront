import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { NotificationService } from '../../services/notification/notification';
import { Notification, NotificationType } from '../../models/notification';

@Component({
  selector: 'app-notifications-drawer',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './notifications-drawer.html',
})
export class NotificationsDrawerComponent implements OnInit {

  private service = inject(NotificationService);

  // =========================
  // STATE (SOLO PROXY)
  // =========================
  open = this.service.isOpen;
  notifications = this.service.notifications;
  unreadCount = this.service.unreadCount; // ✔ FIX: sin función local

  // =========================
  // INTERNAL UI STATE
  // =========================
  private wasOpen = false;
  hydrated = signal(false);

  constructor() {
    effect(() => {
      const isOpen = this.open();

      if (isOpen) {
        this.wasOpen = true;
      }

      if (!isOpen && this.wasOpen) {
        this.markAllAsRead();
        this.wasOpen = false;
      }
    });
  }

  ngOnInit() {

    queueMicrotask(() => {
      this.hydrated.set(true);
    });
  }

  close() {
    this.service.close();
  }



  // =========================
  // HELPERS
  // =========================

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackById(_: number, n: Notification) {
    return n.id;
  }

  // =========================
  // MARK AS READ (BATCH UI)
  // =========================
  private markAllAsRead() {
    const unread = this.notifications().filter(n => !n.isRead);

    if (!unread.length) return;

    unread.forEach(n => {
      this.service.markAsRead(n.id).subscribe({
        error: (err) =>
          console.error('Error marking notification as read', err)
      });
    });
  }

  // =========================
  // ICON CONFIG
  // =========================
  iconConfig: Record<NotificationType, { name: string; color: string }> = {
    [NotificationType.PAYMENT]: {
      name: 'dollar-sign',
      color: 'text-emerald-500'
    },
    [NotificationType.BOOKING]: {
      name: 'calendar',
      color: 'text-blue-500'
    },
    [NotificationType.CANCELLATION]: {
      name: 'x',
      color: 'text-red-500'
    },
    [NotificationType.REMINDER]: {
      name: 'clock',
      color: 'text-yellow-500'
    },
    [NotificationType.SYSTEM]: {
      name: 'settings',
      color: 'text-gray-400'
    }
  };
}