import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonService } from '../../services/person-identity/person-identity';
import { CompaniesService } from '../../services/companies/companies';
import { AuthService } from '../../services/auth/auth';
import { PersonIdentityDTO } from '../../models/person-identity';
import { CompanyDTO } from '../../models/company';
import { CurrentUser } from '../../models/currentUser';
import { LucideAngularModule, Search, Plus, Pencil, Trash2, X } from 'lucide-angular';
import { ModalComponent } from '../../components/modal/modal/modal';
import { CustomersHeader } from './components/customers-header/customers-header';
import { CustomersTable } from './components/customers-table/customers-table';
import { CustomerCreateModal } from './components/customer-create-modal/customer-create-modal';
import { CustomerEditModal } from './components/customer-edit-modal/customer-edit-modal';
import { CustomerDeleteModal } from './components/customer-delete-modal/customer-delete-modal';
interface CustomerForm {
  companyId: number | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface EditCustomerForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CustomersHeader, CustomersTable, CustomerCreateModal, CustomerEditModal, CustomerDeleteModal],
  templateUrl: './customers.html',
  styleUrl: './customers.scss'
})
export class CustomersComponent implements OnInit {
  
  isEditMode = false;
  editModalOpen = false;
  editCustomerId: number | null = null;
  editPersonId: number | null = null;

  deleteModalOpen = false;
  customerToDelete: PersonIdentityDTO | null = null;

  customerForm: CustomerForm = this.createEmptyForm();
  editForm: EditCustomerForm = this.createEmptyEditForm();

  ready = false;
  loading = false;
  currentUser: CurrentUser | null = null;
  allCustomers: PersonIdentityDTO[] = [];
  customers: PersonIdentityDTO[] = [];
  companies: CompanyDTO[] = [];
  searchTerm = '';
  selectedCompanyId: number | null = null;
  modalOpen = false;

  icons = { Search, Plus, Pencil, Trash2, X };
  
  private personService = inject(PersonService);
  private companiesService = inject(CompaniesService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  get isOwner() { return this.currentUser?.role === 'OWNER' }
  get canSelectCompany() { return this.isOwner }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.initContext();
    this.loadData();
  }

  private initContext() {
    this.setCompanyContext();
  }

  private loadData() {
    if (this.isOwner) this.loadCompanies();
    this.loadCustomers();
  }

  private setCompanyContext() {
    const u = this.currentUser;
    if (u?.role === 'ADMIN') this.selectedCompanyId = u.companyId ?? null;
    if (u?.role === 'OWNER') this.selectedCompanyId = null;
  }

  private loadCompanies() {
    this.companiesService.getAll().subscribe({
      next: d => { 
        this.companies = (d ?? []).filter(c => c.status === 'ACTIVE'); 
        this.cdr.detectChanges();
      },
      error: console.error
    });
  }

  private loadCustomers() {
    this.loading = true;
    this.personService.getAll().subscribe({
      next: d => {
        this.allCustomers = (d ?? []).filter(x => x.customer !== null && x.customer !== undefined);
        this.loading = false;
        this.ready = true;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: e => {
        console.error(e);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter() {
    const u = this.currentUser;
    let r = [...this.allCustomers];

    if (u?.role === 'ADMIN' && u.companyId)
      r = r.filter(x => x.person.companyId === u.companyId);

    if (u?.role === 'OWNER' && this.selectedCompanyId !== null)
      r = r.filter(x => x.person.companyId === this.selectedCompanyId);

    const t = this.searchTerm.trim().toLowerCase();

    if (t)
      r = r.filter(x =>
        (x.person.firstName ?? '').toLowerCase().includes(t) ||
        (x.person.lastName ?? '').toLowerCase().includes(t) ||
        (x.person.email ?? '').toLowerCase().includes(t) ||
        (x.person.phone ?? '').toLowerCase().includes(t) ||
        (x.customer?.notes ?? '').toLowerCase().includes(t)
      );

    this.customers = r;
  }

  onCompanyChange() { this.applyFilter(); this.cdr.detectChanges() }
  onSearchChange() { this.applyFilter() }

  onEdit(customer: PersonIdentityDTO) {
    this.isEditMode = true;
    this.editCustomerId = customer.customer!.id;
    this.editPersonId = customer.person.id;

    this.editForm = {
      firstName: customer.person.firstName,
      lastName: customer.person.lastName,
      phone: customer.person.phone,
      email: customer.person.email,
      address: customer.person.address ?? '',
      notes: customer.customer?.notes ?? ''
    };

    this.editModalOpen = true;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editCustomerId = null;
    this.editPersonId = null;
    this.customerForm = this.createEmptyForm();
    
    if (this.currentUser?.role === 'ADMIN') {
      this.customerForm.companyId = this.currentUser.companyId ?? null;
    }
    
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  closeEditModal() {
    this.editModalOpen = false;
    this.editCustomerId = null;
    this.editPersonId = null;
  }

  createCustomer() {
    const f = this.customerForm;

    const companyId =
      this.currentUser?.role === 'OWNER'
        ? f.companyId
        : this.currentUser?.companyId;

    if (!companyId) {
      console.error('Company ID is required');
      return;
    }

    const payload: any = {
      person: {
        firstName: f.firstName,
        lastName: f.lastName,
        phone: f.phone,
        email: f.email,
        address: f.address ?? '',
        companyId
      },
      user: null,
      customer: {
        companyId,
        notes: f.notes
      },
      supplier: null
    };

    this.personService.create(payload).subscribe({
      next: () => {
        this.modalOpen = false;
        this.loadCustomers();
      },
      error: console.error
    });
  }

  updateCustomer() {
    if (!this.editPersonId) {
      console.error('No person ID for update');
      return;
    }

    const f = this.editForm;

    // 🔴 IMPORTANTE: SOLO actualizar la persona
    // NO enviar customer porque el backend no lo permite
    const payload: any = {
      person: {
        firstName: f.firstName,
        lastName: f.lastName,
        phone: f.phone,
        email: f.email,
        address: f.address
      }
      // ❌ NO enviar customer: { notes: f.notes }
    };

    this.personService.patch(this.editPersonId, payload).subscribe({
      next: () => {
        this.editModalOpen = false;
        this.editCustomerId = null;
        this.editPersonId = null;
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error updating customer:', error);
      }
    });
  }

  submit() {
    if (this.isEditMode) {
      this.updateCustomer();
    } else {
      this.createCustomer();
    }
  }

  onDelete(customer: PersonIdentityDTO) {
    this.customerToDelete = customer;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.customerToDelete = null;
  }

  confirmDelete() {
    if (!this.customerToDelete) return;

    this.personService.delete(this.customerToDelete.person.id).subscribe({
      next: () => {
        this.deleteModalOpen = false;
        this.customerToDelete = null;
        this.loadCustomers();
      },
      error: console.error
    });
  }

  private createEmptyForm(): CustomerForm {
    return {
      companyId: null,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    };
  }

  private createEmptyEditForm(): EditCustomerForm {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    };
  }
}