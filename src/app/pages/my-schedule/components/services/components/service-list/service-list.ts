// my-schedule/components/services/components/service-list/service-list.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, Clock } from 'lucide-angular';
import { ServiceCard } from '../service-card/service-card';
import { ServiceDTO } from '../../../../../../models/service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ServiceCard],
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss',
})
export class ServiceList {
  @Input() services: ServiceDTO[] = [];
  @Input() loading = false;
  @Input() canEdit = false;
  @Input() canDelete = false;

  @Output() edit = new EventEmitter<ServiceDTO>();
  @Output() delete = new EventEmitter<ServiceDTO>();

  icons = {
    Pencil,
    Trash2,
    Clock,
  };

  onEdit(service: ServiceDTO): void {
    if (!this.canEdit) return;
    this.edit.emit(service);
  }

  onDelete(service: ServiceDTO): void {
    if (!this.canDelete) return;
    this.delete.emit(service);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'bg-emerald-500/10 text-emerald-400',
      'INACTIVE': 'bg-red-500/10 text-red-400',
      'TEMPORARILY_UNAVAILABLE': 'bg-amber-500/10 text-amber-400',
      'ARCHIVED': 'bg-gray-500/10 text-gray-400'
    };
    return classes[status] || classes['ACTIVE'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive',
      'TEMPORARILY_UNAVAILABLE': 'Unavailable',
      'ARCHIVED': 'Archived'
    };
    return labels[status] || status;
  }

  trackByServiceId(index: number, service: ServiceDTO): number {
    return service.id;
  }
}