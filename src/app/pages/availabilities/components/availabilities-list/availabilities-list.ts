import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { AvailabilityDTO, DayOfWeek, RecurrenceType } from '../../../../models/availability';

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
    return status === 'ACTIVE' ? 'Active' : 'Inactive';
  }

  getDaysLabel(dayOfWeek: DayOfWeek): string {
    if (!dayOfWeek) return 'N/A';
    const map: Record<DayOfWeek, string> = {
      'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed',
      'THURSDAY': 'Thu', 'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
    };
    return map[dayOfWeek] || dayOfWeek;
  }

  getRecurrenceLabel(recurrenceType: RecurrenceType): string {
    const map: Record<RecurrenceType, string> = {
      'NONE': 'None', 'DAILY': 'Daily', 'WEEKLY': 'Weekly', 'MONTHLY': 'Monthly'
    };
    return map[recurrenceType] || recurrenceType;
  }

  formatTime(time: string): string {
    var parts = time.split(':');
    var hours = Number(parts[0]);
    var minutes = Number(parts[1]);
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var h = hours % 12 || 12;
    return h + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm;
  }

  getInitials(name: string): string {
    return (name || 'S').charAt(0).toUpperCase();
  }

  trackById(index: number, item: AvailabilityDTO): number {
    return item.id;
  }
}
