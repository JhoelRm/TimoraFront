import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { ModalComponent } from '../../../../components/modal/modal/modal';
interface EditCustomerForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

@Component({
  selector: 'app-customer-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './customer-edit-modal.html',
  styleUrl: './customer-edit-modal.scss',
})
export class CustomerEditModal {
  @Input() open = false;

  @Input() form: EditCustomerForm = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  };

  @Output() openChange = new EventEmitter<boolean>();

  @Output() save = new EventEmitter<EditCustomerForm>();

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
