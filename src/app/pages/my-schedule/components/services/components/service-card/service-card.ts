// my-schedule/components/services/components/service-card/service-card.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, Clock } from 'lucide-angular';
import { ServiceDTO } from '../../../../../../models/service';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './service-card.html',
  styleUrl: './service-card.scss',
})
export class ServiceCard {
  @Input() service!: ServiceDTO;
  @Input() canEdit = false;
  @Input() canDelete = false;

  @Output() edit = new EventEmitter<ServiceDTO>();
  @Output() delete = new EventEmitter<ServiceDTO>();

  icons = {
    Pencil,
    Trash2,
    Clock,
  };

  onEdit(): void {
    if (!this.canEdit) return;
    this.edit.emit(this.service);
  }

  onDelete(): void {
    if (!this.canDelete) return;
    this.delete.emit(this.service);
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  }
}