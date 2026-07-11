import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AvailabilityDTO } from '../../../../models/availability';

@Component({
  selector: 'app-availabilities-delete-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DialogModule, ButtonModule],
  templateUrl: './availabilities-delete-modal.html',
  styleUrls: ['./availabilities-delete-modal.scss'],
})
export class AvailabilitiesDeleteModal {
  @Input() visible = false;
  @Input() availability: AvailabilityDTO | null = null;
  @Input() loading = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  icons = { X };

  getSupplierName(): string {
    if (!this.availability) return 'proveedor';
    return this.availability.supplierName || `Supplier ${this.availability.supplierId}`;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onVisibleChange(value: boolean): void {
    if (!value) {
      this.cancel.emit();
    }
    this.visibleChange.emit(value);
  }
}