export enum NotificationStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
export enum NotificationType {
  BOOKING = 'BOOKING',
  CANCELLATION = 'CANCELLATION',
  REMINDER = 'REMINDER',
  SYSTEM = 'SYSTEM',
  PAYMENT = 'PAYMENT'
}
export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  isRead: boolean;
  createdAt: string;
  target: string;
}