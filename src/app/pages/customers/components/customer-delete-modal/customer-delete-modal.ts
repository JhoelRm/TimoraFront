import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { ModalComponent } from '../../../../components/modal/modal/modal';
@Component({
  selector: 'app-customer-delete-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModalComponent],
  templateUrl: './customer-delete-modal.html',
  styleUrl: './customer-delete-modal.scss',
})
export class CustomerDeleteModal {
  @Input() open = false;

  @Input() customer: any = null;

  @Output() openChange = new EventEmitter<boolean>();

  @Output() confirm = new EventEmitter<void>();

  icons = {
    X,
  };

  close() {
    this.openChange.emit(false);
  }

  delete() {
    this.confirm.emit();
  }
}
