import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { BookingDTO, BookingStatus } from '../../../../models/appointment';
import { PersonIdentityDTO } from '../../../../models/person-identity';
import { ServiceDTO } from '../../../../models/service';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bookings-list.html',
  styleUrls: ['./bookings-list.scss'],
})
export class BookingsList {
  @Input() bookings: BookingDTO[] = [];
  @Input() loading = false;
  @Input() customers: PersonIdentityDTO[] = [];
  @Input() services: ServiceDTO[] = [];

  @Output() edit = new EventEmitter<BookingDTO>();
  @Output() delete = new EventEmitter<BookingDTO>();

  icons = { Pencil, Trash2 };

  getStatusLabel(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'INACTIVE': 'Inactiva',
      'DELETED': 'Eliminada'
    };
    return map[status] || status;
  }

  getCustomerName(customerId: number): string {
    const customer = this.customers.find(c => c.customer?.id === customerId);
    if (customer) return `${customer.person.firstName} ${customer.person.lastName}`;
    return `Cliente #${customerId}`;
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service?.name || `Servicio #${serviceId}`;
  }

  formatDateTime(dateTime: string): { date: string; time: string } {
    const d = new Date(dateTime);
    const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  }

  getInitials(name: string): string {
    return (name || 'B').charAt(0).toUpperCase();
  }

  trackById(index: number, item: BookingDTO): number {
    return item.id;
  }
}
