import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { ServiceStatus } from '../../../../models/service';
import { ModalComponent } from '../../../../components/modal/modal/modal';

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

  @Input() editForm!: EditServiceForm;

  @Output() openChange = new EventEmitter<boolean>();

  @Output() close = new EventEmitter<void>();

  @Output() save = new EventEmitter<void>();

  icons = {
    X,
  };
}
