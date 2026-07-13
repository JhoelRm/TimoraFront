import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BookingDTO } from '../../../../../../models/booking';

@Component({
  selector: 'app-bookings-delete-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DialogModule, ButtonModule],
  templateUrl: './bookings-delete-modal.html',
  styleUrls: ['./bookings-delete-modal.scss'],
})
export class BookingsDeleteModal {
  @Input() visible = false;
  @Input() booking: BookingDTO | null = null;
  @Input() loading = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  icons = { X };

  getBookingName(): string {
    if (!this.booking) return 'reserva';
    return this.booking.name || `Reserva #${this.booking.id}`;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onVisibleChange(value: boolean): void {
    if (!value) {
      this.cancel.emit();
    }
    this.visibleChange.emit(value);
  }
}