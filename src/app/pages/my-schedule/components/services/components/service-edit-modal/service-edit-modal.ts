// my-schedule/components/services/components/service-edit-modal/service-edit-modal.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { ServiceStatus } from '../../../../../../models/service';
import { ModalComponent } from '../../../../../../components/modal/modal/modal';

interface EditServiceForm {
  name: string;
  description: string;
  price: number | null;
  duration: number | null;
  status: ServiceStatus;
}

@Component({
  selector: 'app-service-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './service-edit-modal.html',
  styleUrl: './service-edit-modal.scss',
})
export class ServiceEditModal {
  @Input() open = false;
  @Input() isLoading = false;  // ← AGREGAR
  @Input() editForm!: EditServiceForm;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  icons = { X };

  statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'TEMPORARILY_UNAVAILABLE', label: 'Temporarily Unavailable' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  onSave(): void {
    this.save.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}