import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { LucideAngularModule, Search, Plus, X } from 'lucide-angular';

@Component({
  selector: 'app-service-header',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, LucideAngularModule],
  templateUrl: './service-header.html',
  styleUrls: ['./service-header.scss'],
})
export class ServiceHeader implements OnChanges {
  @Input() servicesCount = 0;
  @Input() canSelectCompany = false;
  @Input() canSelectSupplier = false;
  @Input() companies: any[] = [];
  @Input() supplierOptions: any[] = [];
  @Input() selectedCompanyId: number | null = null;
  @Input() selectedSupplierId: number | null = null;
  @Input() searchTerm = '';

  @Output() selectedCompanyIdChange = new EventEmitter<number | null>();
  @Output() selectedSupplierIdChange = new EventEmitter<number | null>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() companyChange = new EventEmitter<void>();
  @Output() supplierChange = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<void>();
  @Output() createService = new EventEmitter<void>();

  icons = { Search, Plus, X };

  filteredCompanies: any[] = [];
  filteredSuppliers: any[] = [];
  selectedCompanyObj: any | null = null;
  selectedSupplierObj: any | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companies']) {
      this.filteredCompanies = [...(this.companies ?? [])];
    }
    if (changes['supplierOptions']) {
      this.filteredSuppliers = [...(this.supplierOptions ?? [])];
    }
    if (changes['selectedCompanyId'] || changes['companies']) {
      this.selectedCompanyObj = this.companies.find(c => c.id === this.selectedCompanyId) ?? null;
    }
    if (changes['selectedSupplierId'] || changes['supplierOptions']) {
      this.selectedSupplierObj = this.supplierOptions.find(s => s.id === this.selectedSupplierId) ?? null;
    }
  }

  filterCompany(event: any): void {
    const query = (event.query ?? '').toLowerCase();
    this.filteredCompanies = this.companies.filter(c =>
      c.name.toLowerCase().includes(query)
    );
  }

  filterSupplier(event: any): void {
    const query = (event.query ?? '').toLowerCase();
    this.filteredSuppliers = this.supplierOptions.filter(s =>
      s.name.toLowerCase().includes(query)
    );
  }

  onCompanySelect(event: any): void {
    const company = event.value;
    this.selectedCompanyObj = company;
    this.selectedCompanyIdChange.emit(company?.id ?? null);
    this.companyChange.emit();
  }

  onCompanyClear(): void {
    this.selectedCompanyObj = null;
    this.selectedCompanyIdChange.emit(null);
    this.companyChange.emit();
  }

  onSupplierSelect(event: any): void {
    const supplier = event.value;
    this.selectedSupplierObj = supplier;
    this.selectedSupplierIdChange.emit(supplier?.id ?? null);
    this.supplierChange.emit();
  }

  onSupplierClear(): void {
    this.selectedSupplierObj = null;
    this.selectedSupplierIdChange.emit(null);
    this.supplierChange.emit();
  }

  onSearchChange(): void {
    this.searchTermChange.emit(this.searchTerm);
    this.searchChange.emit();
  }

  onCreate(): void {
    this.createService.emit();
  }
}