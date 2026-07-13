import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { ModalComponent } from '../../modal/modal/modal';

import { ServiceDTO } from '../../../models/service';

@Component({
  selector: 'app-service-delete-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModalComponent],
  templateUrl: './service-delete-modal.html',
  styleUrl: './service-delete-modal.scss',
})
export class ServiceDeleteModal {
  @Input() open = false;

  @Input() service?: ServiceDTO | null;

  @Output() openChange = new EventEmitter<boolean>();

  @Output() close = new EventEmitter<void>();

  @Output() confirm = new EventEmitter<void>();

  icons = {
    X,
  };
}
