// my-schedule/components/services/components/service-delete-modal/service-delete-modal.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { ServiceDTO } from '../../../../../../models/service';
import { ModalComponent } from '../../../../../../components/modal/modal/modal';

@Component({
  selector: 'app-service-delete-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModalComponent],
  templateUrl: './service-delete-modal.html',
  styleUrl: './service-delete-modal.scss',
})
export class ServiceDeleteModal {
  @Input() open = false;
  @Input() isLoading = false;  // ← AGREGAR
  @Input() service: ServiceDTO | null = null;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  icons = { X };

  getServiceName(): string {
    return this.service?.name || 'este servicio';
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}