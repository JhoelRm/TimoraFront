import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { LucideAngularModule, Search, Calendar, List, Plus } from 'lucide-angular';
import { CompanyDTO } from '../../../../models/company';
import { PersonIdentityDTO } from '../../../../models/person-identity';

type ViewMode = 'list' | 'calendar';

@Component({
  selector: 'app-bookings-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoComplete, LucideAngularModule],
  templateUrl: './bookings-filter.html',
  styleUrls: ['./bookings-filter.scss'],
})
export class BookingsFilter implements OnChanges {
  @Input() companies: CompanyDTO[] = [];
  @Input() suppliers: PersonIdentityDTO[] = [];
  @Input() selectedCompanyId: number | null = null;
  @Input() selectedSupplierId: number | null = null;
  @Input() canSelectCompany = false;
  @Input() canSelectSupplier = false;
  @Input() viewMode: ViewMode = 'list';
  @Input() totalBookings = 0;

  @Output() companyChange = new EventEmitter<number | null>();
  @Output() supplierChange = new EventEmitter<number | null>();
  @Output() viewModeChange = new EventEmitter<ViewMode>();
  @Output() addClick = new EventEmitter<void>();

  icons = { Search, Calendar, List, Plus };

  filteredCompanies: CompanyDTO[] = [];
  filteredSuppliers: PersonIdentityDTO[] = [];
  selectedCompanyObj: CompanyDTO | null = null;
  selectedSupplierObj: PersonIdentityDTO | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companies']) {
      this.filteredCompanies = [...(this.companies ?? [])];
    }
    if (changes['suppliers']) {
      this.filteredSuppliers = [...(this.suppliers ?? [])];
    }
    if (changes['companies'] || changes['selectedCompanyId']) {
      this.selectedCompanyObj = this.companies.find(c => c.id === this.selectedCompanyId) ?? null;
    }
    if (changes['suppliers'] || changes['selectedSupplierId']) {
      this.selectedSupplierObj = this.suppliers.find(s => s.supplier?.id === this.selectedSupplierId) ?? null;
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
    this.filteredSuppliers = this.suppliers.filter(s => {
      const name = `${s.person.firstName} ${s.person.lastName}`.toLowerCase();
      return name.includes(query);
    });
  }

  onCompanySelect(company: CompanyDTO): void {
    this.companyChange.emit(company?.id ?? null);
  }

  onCompanyClear(): void {
    this.companyChange.emit(null);
  }

  onSupplierSelect(supplier: PersonIdentityDTO): void {
    this.supplierChange.emit(supplier?.supplier?.id ?? null);
  }

  onSupplierClear(): void {
    this.supplierChange.emit(null);
  }

  setView(value: ViewMode): void {
    this.viewModeChange.emit(value);
  }
}
