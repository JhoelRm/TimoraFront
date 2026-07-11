import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { 
  AvailabilityDTO, 
  getDaysString, 
  getFirstDayOfWeek 
} from '../../../../models/availability';

@Component({
  selector: 'app-availabilities-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './availabilities-list.html',
  styleUrls: ['./availabilities-list.scss'],
})
export class AvailabilitiesList {
  @Input() availabilities: AvailabilityDTO[] = [];
  @Input() loading = false;

  @Output() edit = new EventEmitter<AvailabilityDTO>();
  @Output() delete = new EventEmitter<AvailabilityDTO>();

  icons = { Pencil, Trash2 };

  getStatusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Activo' : 'Inactivo';
  }

  // Obtiene todos los días de la semana como string
  getDaysDisplay(availability: AvailabilityDTO): string {
    return getDaysString(availability);
  }

  // Obtiene el primer día de la semana (para mostrar en la lista)
  getFirstDay(availability: AvailabilityDTO): string {
    return getFirstDayOfWeek(availability);
  }

  getRecurrenceLabel(recurrenceType: string): string {
    const map: Record<string, string> = {
      'NONE': 'NONE',
      'DAILY': 'DAILY',
      'WEEKLY': 'WEEKLY',
      'MONTHLY': 'MONTHLY'
    };
    return map[recurrenceType] || recurrenceType;
  }

  formatTime(time: string): string {
    if (!time) return '--:--';
    const parts = time.split(':');
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return h + ':' + minutes.toString().padStart(2, '0') + ampm;
  }

  getInitials(name: string): string {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getSupplierName(availability: AvailabilityDTO): string {
    return availability.supplierName || `Supplier ${availability.supplierId}`;
  }

  trackById(index: number, item: AvailabilityDTO): number {
    return item.id;
  }
}