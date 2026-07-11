import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus } from 'lucide-angular';

import { CompanyDTO } from '../../../models/company';

@Component({
  selector: 'app-customers-header',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './customers-header.html',
  styleUrl: './customers-header.scss',
})
export class CustomersHeader {
  @Input() totalCustomers = 0;

  @Input() companies: CompanyDTO[] = [];

  @Input() selectedCompanyId: number | null = null;

  @Input() searchTerm = '';

  @Input() canSelectCompany = false;

  @Output() searchChange = new EventEmitter<string>();

  @Output() companyChange = new EventEmitter<number | null>();

  @Output() addCustomer = new EventEmitter<void>();

  icons = {
    Search,
    Plus,
  };

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.searchChange.emit(value);
  }

  onCompanyChange() {
    this.companyChange.emit(this.selectedCompanyId);
  }

  createCustomer() {
    this.addCustomer.emit();
  }
}
{
}
