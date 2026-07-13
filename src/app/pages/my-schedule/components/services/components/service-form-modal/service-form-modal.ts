// my-schedule/components/services/components/service-form-modal/service-form-modal.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';

import { ServiceStatus } from '../../../../../../models/service';
import { ModalComponent } from '../../../../../../components/modal/modal/modal';

interface ServiceForm {
  name: string;
  description: string;
  price: number | null;
  duration: number | null;
  status: ServiceStatus;
}

@Component({
  selector: 'app-service-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './service-form-modal.html',
  styleUrl: './service-form-modal.scss',
})
export class ServiceFormModal {
  @Input() open = false;
  @Input() isLoading = false;
  @Input() serviceForm!: ServiceForm;

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