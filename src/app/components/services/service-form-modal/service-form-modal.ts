import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';

import { PersonIdentityDTO } from '../../../models/person-identity';
import { CompanyDTO } from '../../../models/company';
import { ServiceStatus } from '../../../models/service';
import { ModalComponent } from '../../../components/modal/modal/modal';

interface ServiceForm {
  companyId: number | null;
  supplierId: number | null;
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

  @Input() isOwner = false;

  @Input() isUser = false;

  @Input() companies: CompanyDTO[] = [];

  @Input() modalSuppliers: PersonIdentityDTO[] = [];

  @Input() serviceForm!: ServiceForm;

  @Output() openChange = new EventEmitter<boolean>();

  @Output() modalCompanyChange = new EventEmitter<void>();

  @Output() save = new EventEmitter<void>();

  @Output() close = new EventEmitter<void>();

  icons = {
    X,
  };

  onCompanyChange() {
    this.modalCompanyChange.emit();
  }

  onSave() {
    this.save.emit();
  }

  onClose() {
    this.close.emit();
  }
}
