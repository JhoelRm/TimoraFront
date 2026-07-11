import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { ModalComponent } from '../../modal/modal/modal';

interface CustomerForm {
  companyId: number | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

@Component({
  selector: 'app-customer-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './customer-create-modal.html',
  styleUrl: './customer-create-modal.scss',
})
export class CustomerCreateModal {
  @Input() open = false;

  @Input() companies: any[] = [];

  @Input() currentUser: any = null;

  @Input() canSelectCompany = false;

  @Input() form: CustomerForm = {
    companyId: null,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  };

  @Output() openChange = new EventEmitter<boolean>();

  @Output() save = new EventEmitter<CustomerForm>();

  icons = {
    X,
  };

  close() {
    this.openChange.emit(false);
  }

  submit() {
    this.save.emit(this.form);
  }
}
