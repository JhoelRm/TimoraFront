import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompaniesService } from '../../services/companies/companies';
import { CompanyDTO, CompanyCreateDTO, CompanyPatchDTO } from '../../models/company';
import { LucideAngularModule, Building2, Search, Plus, Phone, Mail, MapPin, Trash2, Pencil, X } from 'lucide-angular';
import { CompaniesHeaderComponent } from './components/companies-header/companies-header';
import { CompanyCardComponent } from './components/companies-card/company-card';
import { CreateCompanyModalComponent } from './components/create-company-modal/create-company-modal';
import { EditCompanyModalComponent } from './components/edit-company-modal/edit-company-modal';
import { DeleteCompanyModalComponent } from './components/delete-company-modal/delete-company-modal';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CompaniesHeaderComponent,
    CompanyCardComponent,
    CreateCompanyModalComponent,
    EditCompanyModalComponent,
    DeleteCompanyModalComponent
],
  templateUrl: './companies.html',
  styleUrl: './companies.scss'
})
export class CompaniesComponent implements OnInit {
  deleteModalOpen = false;
  companyToDelete: CompanyDTO | null = null;

  icons = { Building2, Search, Plus, Phone, Mail, MapPin, Trash2, Pencil, X };

  companies: CompanyDTO[] = [];
  search = '';
  loading = false;

  modalOpen = false;

  form: CompanyCreateDTO = { name: '', ruc: '', address: '', phone: '', email: '' };

  editModalOpen = false;
  editingCompany: CompanyDTO | null = null;

  editForm: CompanyPatchDTO = { name: '', ruc: '', address: '', phone: '', email: '' };

  constructor(private companiesService: CompaniesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.companiesService.getAll().subscribe({
      next: res => { this.companies = res; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  get filteredCompanies(): CompanyDTO[] {
    if (!this.search.trim()) return this.companies;
    const term = this.search.toLowerCase();
    return this.companies.filter(c => c.name.toLowerCase().includes(term) || c.ruc.includes(term));
  }

  trackById(_: number, item: CompanyDTO) { return item.id; }

  openDeleteModal(company: CompanyDTO): void { this.companyToDelete = company; this.deleteModalOpen = true; }

  confirmDelete(): void {
    if (!this.companyToDelete) return;
    this.companiesService.delete(this.companyToDelete.id).subscribe(() => {
      this.companies = this.companies.filter(c => c.id !== this.companyToDelete!.id);
      this.closeDeleteModal();
      this.cdr.detectChanges();
    });
  }

  closeDeleteModal(): void { this.deleteModalOpen = false; this.companyToDelete = null; }

  openCreateModal(): void { this.modalOpen = true; this.resetForm(); }

  closeModal(): void { this.modalOpen = false; }

  createCompany(): void {
    if (!this.form.name || !this.form.ruc) return;
    this.companiesService.create(this.form).subscribe({
      next: newCompany => {
        this.companies = [newCompany, ...this.companies];
        this.resetForm();
        this.modalOpen = false;
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  openEditModal(company: CompanyDTO): void {
    this.editingCompany = company;
    this.editForm = { name: company.name, ruc: company.ruc, address: company.address, phone: company.phone, email: company.email };
    this.editModalOpen = true;
  }

  closeEditModal(): void { this.editModalOpen = false; this.editingCompany = null; }

  updateCompany(): void {
    if (!this.editingCompany) return;
    this.companiesService.patch(this.editingCompany.id, this.editForm).subscribe({
      next: updated => {
        this.companies = this.companies.map(c => c.id === updated.id ? updated : c);
        this.editModalOpen = false;
        this.editingCompany = null;
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  private resetForm(): void {
    this.form = { name: '', ruc: '', address: '', phone: '', email: '' };
  }
}