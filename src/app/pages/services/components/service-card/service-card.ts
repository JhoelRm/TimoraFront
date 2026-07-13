import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, Clock } from 'lucide-angular';


import { ServiceDTO } from '../../../../models/service';


@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './service-card.html',
  styleUrl: './service-card.scss',
})
export class ServiceCard {
  @Input() service!: ServiceDTO;

  @Output() edit = new EventEmitter<ServiceDTO>();

  @Output() delete = new EventEmitter<ServiceDTO>();

  icons = {
    Pencil,
    Trash2,
    Clock,
  };

  onEdit() {
    this.edit.emit(this.service);
  }

  onDelete() {
    this.delete.emit(this.service);
  }

  getStatusClass(status: string) {
    const classes: any = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-400',
      INACTIVE: 'bg-red-500/10 text-red-400',
      TEMPORARILY_UNAVAILABLE: 'bg-amber-500/10 text-amber-400',
      ARCHIVED: 'bg-gray-500/10 text-gray-400',
    };

    return classes[status] || classes.ACTIVE;
  }

  getStatusLabel(status: string) {
    const labels: any = {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      TEMPORARILY_UNAVAILABLE: 'Unavailable',
      ARCHIVED: 'Archived',
    };

    return labels[status] || status;
  }
}
