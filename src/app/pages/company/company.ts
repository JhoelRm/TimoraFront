import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompaniesService } from '../../services/companies/companies';
import { AuthService } from '../../services/auth/auth';
import { CompanyDTO, CompanyPatchDTO } from '../../models/company';
import { LucideAngularModule, Building2, Phone, Mail, MapPin, Save, X, AlertCircle } from 'lucide-angular';
import { CompanyHeader } from '../companies/components/company-header/company-header';
import { CompanyForm } from '../companies/components/company-form/company-form';
import { CompanyFeedback } from '../companies/components/company-feedback/company-feedback';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CompanyHeader,CompanyForm, CompanyFeedback],
  templateUrl: './company.html',
  styleUrls: ['./company.scss']
})
export class CompanyComponent implements OnInit {
  icons = { Building2, Phone, Mail, MapPin, Save, X, AlertCircle };

  company: CompanyDTO | null = null;
  editForm: CompanyPatchDTO = {};
  
  loading = false;
  saving = false;
  error: string | null = null;
  saveSuccess = false;

  validationErrors: { [key: string]: string } = {};

  constructor(
    private companiesService: CompaniesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompany();
  }

  loadCompany(): void {
    const currentUser = this.authService.getUser();
    
    if (!currentUser || !currentUser.companyId) {
      this.error = 'No company associated with your account';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = null;
    this.saveSuccess = false;

    this.companiesService.getById(currentUser.companyId).subscribe({
      next: (company) => {
        this.company = company;
        this.editForm = {
          name: company.name,
          ruc: company.ruc,
          address: company.address,
          phone: company.phone,
          email: company.email
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading company:', err);
        this.error = err.message || 'Failed to load company data';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isFormValid(): boolean {
    this.validateForm();
    return Object.keys(this.validationErrors).length === 0;
  }

  validateForm(): void {
    // Limpiar errores anteriores
    this.validationErrors = {};

    // Validar nombre
    if (!this.editForm.name || this.editForm.name.trim().length === 0) {
      this.validationErrors['name'] = 'Company name is required';
    } else if (this.editForm.name.trim().length < 2) {
      this.validationErrors['name'] = 'Company name must be at least 2 characters';
    }

    // Validar RUC
    if (this.editForm.ruc) {
      const rucClean = this.editForm.ruc.replace(/\D/g, '');
      if (rucClean.length !== 11) {
        this.validationErrors['ruc'] = 'RUC must have exactly 11 digits';
      }
    }

    // Validar email
    if (this.editForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.editForm.email)) {
        this.validationErrors['email'] = 'Invalid email format';
      }
    }
  }

  saveChanges(): void {
    if (!this.company || !this.isFormValid()) {
      return;
    }

    this.saving = true;
    this.saveSuccess = false;
    this.error = null;

    // Remove empty fields from patch DTO
    const patchData: CompanyPatchDTO = {};
    Object.keys(this.editForm).forEach(key => {
      const value = this.editForm[key as keyof CompanyPatchDTO];
      if (value !== undefined && value !== null && value !== '') {
        patchData[key as keyof CompanyPatchDTO] = value;
      }
    });

    this.companiesService.patch(this.company.id, patchData).subscribe({
      next: (updated) => {
        this.company = updated;
        this.editForm = {
          name: updated.name,
          ruc: updated.ruc,
          address: updated.address,
          phone: updated.phone,
          email: updated.email
        };
        this.saving = false;
        this.saveSuccess = true;
        this.cdr.detectChanges();

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.saveSuccess = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating company:', err);
        this.error = err.message || 'Failed to update company';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}