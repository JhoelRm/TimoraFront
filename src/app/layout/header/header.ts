import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification/notification';

type UserRole = 'OWNER' | 'ADMIN' | 'USER';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
})
export class HeaderComponent {

  private notificationsService = inject(NotificationService);

  // =========================
  // INPUTS
  // =========================
  @Input() title: string = '';
  @Input() role?: UserRole;

  // =========================
  // OUTPUTS
  // =========================
  @Output() notificationsToggle = new EventEmitter<void>();

  toggleNotifications() {
    this.notificationsToggle.emit();
  }

  // =========================
  // SIGNALS FROM SERVICE
  // =========================

  // Badge activo si existe al menos una notificación no leída
  hasNotifications = this.notificationsService.hasNewNotifications;

  // Contador reactivo de no leídas
  unreadCount = this.notificationsService.unreadCount;
}