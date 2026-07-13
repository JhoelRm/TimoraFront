import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus } from 'lucide-angular';

@Component({
  selector: 'app-service-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './service-header.html',
  styleUrl: './service-header.scss',
})
export class ServiceHeader {
  @Input() servicesCount = 0;

  @Input() canSelectCompany = false;
  @Input() canSelectSupplier = false;

  @Input() companies: any[] = [];
  @Input() supplierOptions: any[] = [];

  @Input() selectedCompanyId: number | null = null;
  @Input() selectedSupplierId: number | null = null;

  @Input() searchTerm = '';

  // PARA TWO WAY BINDING
  @Output() selectedCompanyIdChange = new EventEmitter<number | null>();
  @Output() selectedSupplierIdChange = new EventEmitter<number | null>();
  @Output() searchTermChange = new EventEmitter<string>();

  // EVENTOS NORMALES
  @Output() companyChange = new EventEmitter<void>();
  @Output() supplierChange = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<void>();
  @Output() createService = new EventEmitter<void>();

  icons = {
    Search,
    Plus,
  };

  onCompanyChange() {
    this.selectedCompanyIdChange.emit(this.selectedCompanyId);

    this.companyChange.emit();
  }

  onSupplierChange() {
    this.selectedSupplierIdChange.emit(this.selectedSupplierId);

    this.supplierChange.emit();
  }

  onSearchChange() {
    this.searchTermChange.emit(this.searchTerm);

    this.searchChange.emit();
  }

  onCreate() {
    this.createService.emit();
  }
}
