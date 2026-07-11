import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { LucideAngularModule, Search, Calendar, List, Plus, X } from 'lucide-angular';
import { CompanyDTO } from '../../../../models/company';
import { PersonIdentityDTO } from '../../../../models/person-identity';

type ViewMode = 'list' | 'calendar';

@Component({
  selector: 'app-availabilities-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, LucideAngularModule],
  templateUrl: './availabilities-filter.html',
  styleUrls: ['./availabilities-filter.scss'],
})
export class AvailabilitiesFilter implements OnChanges {
  @Input() companies: CompanyDTO[] = [];
  @Input() suppliers: PersonIdentityDTO[] = [];
  @Input() selectedCompanyId: number | null = null;
  @Input() selectedSupplierId: number | null = null;
  @Input() canSelectCompany = false;
  @Input() canSelectSupplier = false;
  @Input() viewMode: ViewMode = 'calendar';
  @Input() totalSchedules = 0;
  @Input() isReadOnly = false;
  @Input() currentUserPersonId: number | null = null; // 🔴 NUEVO: para identificar al usuario

  @Output() companyChange = new EventEmitter<number | null>();
  @Output() supplierChange = new EventEmitter<number | null>();
  @Output() viewModeChange = new EventEmitter<ViewMode>();
  @Output() addClick = new EventEmitter<void>();

  icons = { Search, Calendar, List, Plus, X };

  filteredCompanies: CompanyDTO[] = [];
  filteredSuppliers: PersonIdentityDTO[] = [];
  selectedCompanyObj: CompanyDTO | null = null;
  selectedSupplierObj: PersonIdentityDTO | null = null;

  // 🔴 NUEVO: Lista de suppliers con opción "Míos"
  displaySuppliers: PersonIdentityDTO[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companies']) {
      this.filteredCompanies = [...(this.companies ?? [])];
    }
    if (changes['suppliers']) {
      this.filteredSuppliers = [...(this.suppliers ?? [])];
      this.buildDisplaySuppliers();
    }
    if (changes['companies'] || changes['selectedCompanyId']) {
      this.selectedCompanyObj = this.companies.find(c => c.id === this.selectedCompanyId) ?? null;
    }
    if (changes['suppliers'] || changes['selectedSupplierId']) {
      this.selectedSupplierObj = this.suppliers.find(s => s.supplier?.id === this.selectedSupplierId) ?? null;
    }
  }

  // 🔴 NUEVO: Construir lista de suppliers con opción "Míos"
  private buildDisplaySuppliers(): void {
    this.displaySuppliers = [...this.suppliers];
  }

  getSupplierLabel(supplier: PersonIdentityDTO): string {
    if (!supplier) return '';
    return `${supplier.person.firstName} ${supplier.person.lastName}`;
  }

  filterCompany(event: any): void {
    const query = (event.query ?? '').toLowerCase();
    this.filteredCompanies = this.companies.filter(c =>
      c.name.toLowerCase().includes(query)
    );
  }

  filterSupplier(event: any): void {
    const query = (event.query ?? '').toLowerCase();
    this.filteredSuppliers = this.suppliers.filter(s => {
      const name = `${s.person.firstName} ${s.person.lastName}`.toLowerCase();
      return name.includes(query);
    });
  }

  onCompanySelect(event: any): void {
    const company = event.value as CompanyDTO;
    console.log('✅ Company seleccionada:', company);
    this.companyChange.emit(company?.id ?? null);
  }

  onCompanyClear(): void {
    this.companyChange.emit(null);
    this.selectedCompanyObj = null;
  }

  onSupplierSelect(event: any): void {
    const supplier = event.value as PersonIdentityDTO;
    console.log('✅ Supplier seleccionado:', supplier);
    this.supplierChange.emit(supplier?.supplier?.id ?? null);
  }

  onSupplierClear(): void {
    this.supplierChange.emit(null);
    this.selectedSupplierObj = null;
  }

  setView(value: ViewMode): void {
    this.viewModeChange.emit(value);
  }

  getCompanyIdFromSupplier(supplierId: number | null): number | null {
    if (!supplierId) return null;
    const supplier = this.suppliers.find(s => s.supplier?.id === supplierId);
    return supplier?.person.companyId ?? null;
  }
}