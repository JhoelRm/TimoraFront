import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2, Clock } from 'lucide-angular';
import { ServiceCard } from '../service-card/service-card';
import { ServiceDTO } from '../../../models/service';

interface SupplierView {
  id: number;
  name: string;
  specialty?: string;
}

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ServiceCard],
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss',
})
export class ServiceList {
  @Input() services: ServiceDTO[] = [];

  @Input() suppliers: SupplierView[] = [];

  @Output() edit = new EventEmitter<ServiceDTO>();

  @Output() delete = new EventEmitter<ServiceDTO>();

  icons = {
    Pencil,
    Trash2,
    Clock,
  };

  getServicesBySupplier(id: number) {
    return this.services.filter((s) => s.supplierId === id);
  }

  onEdit(service: ServiceDTO) {
    this.edit.emit(service);
  }

  onDelete(service: ServiceDTO) {
    this.delete.emit(service);
  }
  getUniqueSuppliers(): SupplierView[] {
    const map = new Map<number, SupplierView>();

    for (const service of this.services) {
      if (!map.has(service.supplierId)) {
        map.set(service.supplierId, {
          id: service.supplierId,
          name: service.supplierName,
          specialty: 'Supplier',
        });
      }
    }

    return Array.from(map.values());
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
