import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { LucideAngularModule, Search, Plus, X } from 'lucide-angular';

import { CompanyDTO } from '../../../../models/company';

@Component({
  selector: 'app-customers-header',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, LucideAngularModule],
  templateUrl: './customers-header.html',
  styleUrls: ['./customers-header.scss'],
})
export class CustomersHeader implements OnChanges {
  @Input() totalCustomers = 0;
  @Input() companies: CompanyDTO[] = [];
  @Input() selectedCompanyId: number | null = null;
  @Input() searchTerm = '';
  @Input() canSelectCompany = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() companyChange = new EventEmitter<number | null>();
  @Output() addCustomer = new EventEmitter<void>();

  icons = { Search, Plus, X };

  filteredCompanies: CompanyDTO[] = [];
  selectedCompanyObj: CompanyDTO | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companies']) {
      this.filteredCompanies = [...(this.companies ?? [])];
    }
    if (changes['companies'] || changes['selectedCompanyId']) {
      this.selectedCompanyObj = this.companies.find(c => c.id === this.selectedCompanyId) ?? null;
    }
  }

  filterCompany(event: any): void {
    const query = (event.query ?? '').toLowerCase();
    this.filteredCompanies = this.companies.filter(c =>
      c.name.toLowerCase().includes(query)
    );
  }

  onCompanySelect(event: any): void {
    const company = event.value as CompanyDTO;
    this.selectedCompanyObj = company;
    this.companyChange.emit(company?.id ?? null);
  }

  onCompanyClear(): void {
    this.selectedCompanyObj = null;
    this.companyChange.emit(null);
  }

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }
}