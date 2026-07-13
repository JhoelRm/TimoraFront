import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicesService } from '../../services/service/service';
import { CompaniesService } from '../../services/companies/companies';
import { PersonService } from '../../services/person-identity/person-identity';
import { AuthService } from '../../services/auth/auth';
import { ServiceDTO, ServiceCreateDTO, ServicePatchDTO, ServiceStatus } from '../../models/service';
import { CompanyDTO } from '../../models/company';
import { PersonIdentityDTO } from '../../models/person-identity';
import { CurrentUser } from '../../models/currentUser';
import { LucideAngularModule, Search, Plus, Pencil, Trash2, X, Clock } from 'lucide-angular';
import { ModalComponent } from '../../components/modal/modal/modal';
import { ServiceHeader } from './services/service-header/service-header';
import { ServiceList } from './services/service-list/service-list';
import { ServiceFormModal } from './services/service-form-modal/service-form-modal';
import { ServiceEditModal } from './services/service-edit-modal/service-edit-modal';
import { ServiceDeleteModal } from './services/service-delete-modal/service-delete-modal';

interface ServiceForm {
  companyId: number | null;
  supplierId: number | null;
  name: string;
  description: string;
  price: number | null;
  duration: number | null;
  status: ServiceStatus;
}

interface EditServiceForm {
  name: string;
  description: string;
  price: number | null;
  duration: number | null;
  status: ServiceStatus;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ServiceHeader, ServiceList, ServiceFormModal, ServiceEditModal, ServiceDeleteModal],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class ServicesComponent implements OnInit {
  
  isEditMode = false;
  editModalOpen = false;
  editServiceId: number | null = null;

  deleteModalOpen = false;
  serviceToDelete: ServiceDTO | null = null;

  serviceForm: ServiceForm = this.createEmptyForm();
  editForm: EditServiceForm = this.createEmptyEditForm();

  currentUser: CurrentUser | null = null;
  currentUserSupplier: PersonIdentityDTO | null = null;
  allServices: ServiceDTO[] = [];
  services: ServiceDTO[] = [];
  companies: CompanyDTO[] = [];
  allSuppliers: PersonIdentityDTO[] = [];
  filteredSuppliers: PersonIdentityDTO[] = [];
  modalSuppliers: PersonIdentityDTO[] = [];
  
  searchTerm = '';
  selectedCompanyId: number | null = null;
  selectedSupplierId: number | null = null;

  loading = false;
  ready = false;
  modalOpen = false;

  private _cachedSupplierOptions: { id: number, name: string }[] = [];
  private _cachedUniqueSuppliers: { id: number, name: string, specialty?: string }[] = [];

  icons = { Search, Plus, Pencil, Trash2, X, Clock };
  
  private servicesService = inject(ServicesService);
  private companiesService = inject(CompaniesService);
  private personService = inject(PersonService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  get isOwner() { return this.currentUser?.role === 'OWNER' }
  get isAdmin() { return this.currentUser?.role === 'ADMIN' }
  get isUser() { return this.currentUser?.role === 'USER' }
  get canSelectCompany() { return this.isOwner }
  get canSelectSupplier() { return this.isOwner || this.isAdmin }

  get supplierOptions(): { id: number, name: string }[] {
    return this._cachedSupplierOptions;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadData();
  }

  private loadData() {
    if (this.isOwner) this.loadCompanies();
    this.loadSuppliers();
    this.loadCurrentUserSupplier();
    this.loadServices();
  }

private loadCompanies() {
  this.companiesService.getAll().subscribe({
    next: d => {
      this.companies = (d ?? []).filter(c => c.status === 'ACTIVE'); // 👈 filtro
      this.cdr.detectChanges();
    },
    error: console.error
  });
}

private loadSuppliers() {
  this.personService.getAll().subscribe({
    next: d => {
      let suppliers = (d ?? [])
        .filter(x => x.supplier !== null && x.supplier !== undefined)
        .filter(x => x.person.status === 'ACTIVE'); // 👈 FILTRO AQUÍ

      if (this.isUser && this.currentUser) {
        suppliers = suppliers.filter(s => s.person.id === this.currentUser?.personId);
      }
      if (this.isAdmin && this.currentUser) {
        suppliers = suppliers.filter(s => s.person.companyId === this.currentUser?.companyId);
      }
      this.allSuppliers = suppliers;
      this.updateModalSuppliers();
      this.filterSuppliersByCompany();
      this.cdr.detectChanges();
    },
    error: console.error
  });
}

  private loadCurrentUserSupplier() {
    if (!this.currentUser) return;
    this.personService.getById(this.currentUser.personId).subscribe({
      next: (person) => {
        if (person.supplier) {
          this.currentUserSupplier = person;
        }
        this.cdr.detectChanges();
      },
      error: console.error
    });
  }

  private loadServices() {
    this.loading = true;
    this.servicesService.getAll().subscribe({
      next: (d) => {
        this.allServices = d ?? [];
        this.loading = false;
        this.ready = true;
        this.applyFilter();
        this.updateCache();
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

filterSuppliersByCompany() {
  if (this.isOwner && this.selectedCompanyId !== null) {
    this.filteredSuppliers = this.allSuppliers.filter(s => s.person.companyId === this.selectedCompanyId);
  } else {
    this.filteredSuppliers = this.allSuppliers;
  }

  // 👇 Actualizar opciones del select de suppliers
  this._cachedSupplierOptions = this.filteredSuppliers.map(s => ({
    id: s.supplier!.id,
    name: `${s.person.firstName} ${s.person.lastName}`
  }));

  if (this.selectedSupplierId !== null) {
    const stillExists = this.filteredSuppliers.some(s => s.supplier?.id === this.selectedSupplierId);
    if (!stillExists) {
      this.selectedSupplierId = null;
    }
  }
  this.cdr.detectChanges();
}

  applyFilter() {
    let r = [...this.allServices];
    if (this.isOwner && this.selectedCompanyId !== null) {
      r = r.filter(x => x.companyId === this.selectedCompanyId);
    }
    if ((this.isOwner || this.isAdmin) && this.selectedSupplierId !== null) {
      r = r.filter(x => x.supplierId === this.selectedSupplierId);
    }
    const t = this.searchTerm.trim().toLowerCase();
    if (t) {
      r = r.filter(x =>
        x.name.toLowerCase().includes(t) ||
        x.description.toLowerCase().includes(t) ||
        x.supplierName.toLowerCase().includes(t)
      );
    }
    this.services = r;
    this.updateCache();
  }

  onCompanyChange() {
    this.selectedSupplierId = null;
    this.filterSuppliersByCompany();
    this.applyFilter();
    this.cdr.detectChanges();
  }

  onSupplierChange() {
    this.applyFilter();
    this.cdr.detectChanges();
  }

  onSearchChange() {
    this.applyFilter();
  }

  private updateCache() {
    let services = this.allServices;
    if (this.isOwner && this.selectedCompanyId !== null) {
      services = services.filter(s => s.companyId === this.selectedCompanyId);
    }
    const supplierMap = new Map<number, string>();
    for (const service of services) {
      if (!supplierMap.has(service.supplierId)) {
        supplierMap.set(service.supplierId, service.supplierName);
      }
    }
    const supplierIds = new Set(this.services.map(s => s.supplierId));
    this._cachedUniqueSuppliers = [];
    for (const id of supplierIds) {
      const service = this.services.find(s => s.supplierId === id);
      if (service) {
        const supplier = this.allSuppliers.find(s => s.supplier?.id === id);
        this._cachedUniqueSuppliers.push({
          id: service.supplierId,
          name: service.supplierName,
          specialty: supplier?.supplier?.specialty || 'Supplier'
        });
      }
    }
  }

  getServicesBySupplier(supplierId: number): ServiceDTO[] {
    return this.services.filter(s => s.supplierId === supplierId);
  }

  getUniqueSuppliers(): { id: number, name: string, specialty?: string }[] {
    return this._cachedUniqueSuppliers;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'ACTIVE': 'bg-emerald-500/10 text-emerald-400',
      'INACTIVE': 'bg-red-500/10 text-red-400',
      'TEMPORARILY_UNAVAILABLE': 'bg-amber-500/10 text-amber-400',
      'ARCHIVED': 'bg-gray-500/10 text-gray-400'
    };
    return classes[status] || classes['ACTIVE'];
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive',
      'TEMPORARILY_UNAVAILABLE': 'Unavailable',
      'ARCHIVED': 'Archived'
    };
    return labels[status] || status;
  }

  createService() {
    const f = this.serviceForm;
    let companyId: number | null = null;
    if (this.isOwner) {
      companyId = f.companyId;
    } else if (this.isAdmin || this.isUser) {
      companyId = this.currentUser?.companyId ?? null;
    }
    if (!companyId) {
      console.error('Company ID is required');
      return;
    }
    let supplierId: number | null = null;
    if (this.isUser && this.currentUserSupplier?.supplier) {
      supplierId = this.currentUserSupplier.supplier.id;
    } else {
      supplierId = f.supplierId;
    }
    if (!supplierId) {
      console.error('Supplier is required');
      return;
    }
    if (!f.name) {
      console.error('Service name is required');
      return;
    }
    if (!f.price) {
      console.error('Price is required');
      return;
    }
    if (!f.duration) {
      console.error('Duration is required');
      return;
    }
    const payload: ServiceCreateDTO = {
      companyId: Number(companyId),
      supplierId: Number(supplierId),
      name: f.name,
      description: f.description || '',
      price: Number(f.price),
      duration: Number(f.duration),
      status: f.status || 'ACTIVE'
    };
    this.servicesService.create(payload).subscribe({
      next: () => {
        this.modalOpen = false;
        this.loadServices();
      },
      error: (error) => {
        console.error('Error creating service:', error);
      }
    });
  }

onEdit(service: ServiceDTO) {
  console.log('onEdit ejecutado, editModalOpen:', this.editModalOpen);
  this.isEditMode = true;
  this.editServiceId = service.id;
  this.editForm = {
    name: service.name,
    description: service.description,
    price: service.price,
    duration: service.duration,
    status: service.status
  };
  // Aplazar la apertura del modal para evitar el error
  setTimeout(() => {
    this.editModalOpen = true;
  });
}

  closeEditModal() {
    this.editModalOpen = false;
    this.editServiceId = null;
  }
  updateService() {
    if (!this.editServiceId) {
      console.error('No service ID for update');
      return;
    }
    const f = this.editForm;
    const payload: ServicePatchDTO = {
      name: f.name,
      description: f.description,
      price: f.price || undefined,
      duration: f.duration || undefined,
      status: f.status
    };
    this.servicesService.patch(this.editServiceId, payload).subscribe({
      next: () => {
        this.editModalOpen = false;
        this.editServiceId = null;
        this.loadServices();
        // Forzar detección después de la recarga
        this.cdr.detectChanges();
      },
      error: console.error
    });
  }

  onDelete(service: ServiceDTO) {
    this.serviceToDelete = service;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.serviceToDelete = null;
  }

  confirmDelete() {
    if (!this.serviceToDelete) return;
    this.servicesService.delete(this.serviceToDelete.id).subscribe({
      next: () => {
        this.deleteModalOpen = false;
        this.serviceToDelete = null;
        this.loadServices();
      },
      error: console.error
    });
  }

  private createEmptyForm(): ServiceForm {
    return {
      companyId: null,
      supplierId: null,
      name: '',
      description: '',
      price: null,
      duration: null,
      status: 'ACTIVE'
    };
  }

  private createEmptyEditForm(): EditServiceForm {
    return {
      name: '',
      description: '',
      price: null,
      duration: null,
      status: 'ACTIVE'
    };
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editServiceId = null;
    this.serviceForm = this.createEmptyForm();
    if (this.isAdmin && this.currentUser) {
      this.serviceForm.companyId = this.currentUser.companyId ?? null;
    }
    if (this.isUser && this.currentUserSupplier?.supplier) {
      this.serviceForm.companyId = this.currentUser?.companyId ?? null;
      this.serviceForm.supplierId = this.currentUserSupplier.supplier.id;
    }
    this.updateModalSuppliers();
    this.modalOpen = true;
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  closeModal() {
    this.modalOpen = false;
    this.modalSuppliers = [];
    this.serviceForm = this.createEmptyForm();
  }

  onModalCompanyChange() {
    this.updateModalSuppliers();
    this.serviceForm.supplierId = null;
    this.cdr.detectChanges();
  }

  private updateModalSuppliers() {
    const companyId = this.serviceForm.companyId;
    let suppliers = this.allSuppliers.filter(s => s.supplier !== null && s.supplier !== undefined);
    if (companyId !== null && companyId !== undefined) {
      const companyIdNum = Number(companyId);
      suppliers = suppliers.filter(s => s.person.companyId === companyIdNum);
    }
    this.modalSuppliers = suppliers;
    if (this.serviceForm.supplierId !== null) {
      const stillExists = this.modalSuppliers.some(s => s.supplier?.id === this.serviceForm.supplierId);
      if (!stillExists) {
        this.serviceForm.supplierId = null;
      }
    }
    this.cdr.detectChanges();
  }

  trackBySupplierId(index: number, item: PersonIdentityDTO): number {
    return item.supplier?.id ?? index;
  }
}