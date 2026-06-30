import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CompaniesService } from '../../services/companies/companies';
import { CompanyDTO, CompanyCreateDTO } from '../../models/company';

// ✅ MODAL IMPORT
import { ModalComponent } from '../../components/modal/modal/modal';

import {
  LucideAngularModule,
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Pencil,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ModalComponent
  ],
  templateUrl: './companies.html',
  styleUrl: './companies.scss',
})
export class CompaniesComponent implements OnInit {

  icons = {
    Building2,
    Search,
    Plus,
    Phone,
    Mail,
    MapPin,
    Trash2,
    Pencil,
    X
  };

  companies: CompanyDTO[] = [];
  search = '';
  loading = false;

  modalOpen = false;

  form: CompanyCreateDTO = {
    name: '',
    ruc: '',
    address: '',
    phone: '',
    email: ''
  };

  constructor(
    private companiesService: CompaniesService,
    private cdr: ChangeDetectorRef   // ✅ AÑADIDO
  ) {}

  ngOnInit(): void {
    console.log('CompaniesComponent INIT');
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;

    this.companiesService.getAll().subscribe({
      next: (res) => {
        this.companies = res;
        this.loading = false;

        // ✅ FIX NG0100
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredCompanies(): CompanyDTO[] {
    if (!this.search.trim()) return this.companies;

    const term = this.search.toLowerCase();

    return this.companies.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.ruc.includes(term)
    );
  }

  trackById(_: number, item: CompanyDTO) {
    return item.id;
  }

  deleteCompany(id: number): void {
    this.companiesService.delete(id).subscribe(() => {
      this.companies = this.companies.filter(c => c.id !== id);

      // ✅ por seguridad visual
      this.cdr.detectChanges();
    });
  }

  openCreateModal(): void {
    this.modalOpen = true;
    this.resetForm();
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  createCompany(): void {
    if (!this.form.name || !this.form.ruc) return;

    this.companiesService.create(this.form).subscribe({
      next: (newCompany) => {

        this.companies = [newCompany, ...this.companies];

        this.resetForm();
        this.modalOpen = false;

        // ✅ FIX NG0100
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating company', err);
      }
    });
  }

  private resetForm(): void {
    this.form = {
      name: '',
      ruc: '',
      address: '',
      phone: '',
      email: ''
    };
  }
}