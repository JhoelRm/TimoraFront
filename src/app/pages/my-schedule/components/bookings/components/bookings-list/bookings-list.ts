import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { BookingDTO } from '../../../../../../models/booking';
import { PersonIdentityDTO } from '../../../../../../models/person-identity';


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
  @Input() canEdit = false;   // ← NUEVO INPUT
  @Input() canDelete = false; // ← NUEVO INPUT
  @Input() customersMap: Map<number, PersonIdentityDTO> = new Map(); // ← NUEVO INPUT

  @Output() edit = new EventEmitter<BookingDTO>();
  @Output() delete = new EventEmitter<BookingDTO>();

  icons = { Pencil, Trash2 };

  // ==================== MÉTODOS CON PERMISOS ====================
  onEdit(booking: BookingDTO): void {
    if (!this.canEdit) return; // ← Si no tiene permiso, no hace nada
    this.edit.emit(booking);
  }

  onDelete(booking: BookingDTO): void {
    if (!this.canDelete) return; // ← Si no tiene permiso, no hace nada
    this.delete.emit(booking);
  }

  // ==================== GETTERS ====================
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'INACTIVE': 'Inactiva',
      'DELETED': 'Eliminada'
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'bg-yellow-500/10 text-yellow-400',
      'CONFIRMED': 'bg-emerald-500/10 text-emerald-400',
      'COMPLETED': 'bg-blue-500/10 text-blue-400',
      'CANCELLED': 'bg-red-500/10 text-red-400',
      'INACTIVE': 'bg-gray-500/10 text-gray-400',
      'DELETED': 'bg-gray-500/10 text-gray-400'
    };
    return map[status] || 'bg-gray-500/10 text-gray-400';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      'APPOINTMENT': 'Cita',
      'RESERVATION': 'Reserva'
    };
    return map[type] || type;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getBookingName(booking: BookingDTO): string {
    return booking.name || `Reserva #${booking.id}`;
  }

  // 🔥 NUEVO: Obtener nombre del cliente desde el mapa
  getCustomerName(booking: BookingDTO): string {
    const customer = this.customersMap.get(booking.customerId);
    if (customer) {
      return `${customer.person.firstName} ${customer.person.lastName}`.trim();
    }
    return `Cliente #${booking.customerId}`;
  }

  // 🔥 NUEVO: Obtener nombre del servicio (puedes expandir con otro mapa si lo necesitas)
  getServiceName(booking: BookingDTO): string {
    // Si tienes un mapa de servicios, puedes usarlo aquí
    // Por ahora sigue mostrando el ID
    return `Servicio #${booking.serviceId}`;
  }

  trackById(index: number, item: BookingDTO): number {
    return item.id;
  }
  
}