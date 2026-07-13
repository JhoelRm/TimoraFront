// my-schedule/components/services/services.component.ts
import { Component, OnInit, inject, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicesService } from '../../../../services/service/service';
import { PersonService } from '../../../../services/person-identity/person-identity';
import { AuthService } from '../../../../services/auth/auth';
import { ServiceDTO, ServiceCreateDTO, ServicePatchDTO, ServiceStatus } from '../../../../models/service';
import { PersonIdentityDTO } from '../../../../models/person-identity';
import { LucideAngularModule, Search, Plus, Pencil, Trash2, X, Clock } from 'lucide-angular';
import { ServiceHeader } from './components/service-header/service-header';
import { ServiceList } from './components/service-list/service-list';
import { ServiceFormModal } from './components/service-form-modal/service-form-modal';
import { ServiceEditModal } from './components/service-edit-modal/service-edit-modal';
import { ServiceDeleteModal } from './components/service-delete-modal/service-delete-modal';

interface ServiceForm {
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
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule, 
    ServiceHeader, 
    ServiceList, 
    ServiceFormModal, 
    ServiceEditModal, 
    ServiceDeleteModal
  ],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class ServicesComponent implements OnInit, OnChanges {
  
  // ==================== INPUTS ====================
  @Input() supplierId: number | null = null;
  @Input() companyId: number | null = null;
  @Input() hasCreatePermission = false;
  @Input() hasReadPermission = false;
  @Input() hasUpdatePermission = false;
  @Input() hasDeletePermission = false;

  // ==================== INYECCIONES ====================
  private servicesService = inject(ServicesService);
  private personService = inject(PersonService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // ==================== ESTADO ====================
  loading = false;
  error: string | null = null;

  // ==================== DATOS ====================
  allServices: ServiceDTO[] = [];
  services: ServiceDTO[] = [];

  // ==================== MODALES ====================
  modalOpen = false;
  editModalOpen = false;
  deleteModalOpen = false;
  isEditMode = false;
  editServiceId: number | null = null;
  serviceToDelete: ServiceDTO | null = null;

  // ==================== FORMULARIOS ====================
  serviceForm: ServiceForm = this.createEmptyForm();
  editForm: EditServiceForm = this.createEmptyEditForm();

  // ==================== GETTERS ====================
  get totalServices(): number { return this.services.length; }
  get canCreate(): boolean { return this.hasCreatePermission && !!this.supplierId; }
  get canRead(): boolean { return this.hasReadPermission && !!this.supplierId; }

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplierId'] && this.supplierId) {
      this.loadServices();
    }
  }

  // ==================== CARGAR SERVICIOS ====================
  private loadServices(): void {
    if (!this.canRead || !this.supplierId) {
      this.services = [];
      this.allServices = [];
      return;
    }

    this.loading = true;
    this.error = null;

    this.servicesService.getAll().subscribe({
      next: (data) => {
        // Filtrar servicios por supplier
        this.allServices = (data ?? []).filter(s => s.supplierId === this.supplierId);
        this.services = this.allServices;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.error = 'Failed to load services';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== MODAL - CREACIÓN ====================
  onAddClick(): void {
    if (!this.canCreate) return;

    this.isEditMode = false;
    this.editServiceId = null;
    this.serviceForm = this.createEmptyForm();
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.serviceForm = this.createEmptyForm();
  }

  createService(): void {
    const f = this.serviceForm;

    if (!f.name) {
      alert('El nombre del servicio es requerido');
      return;
    }
    if (!f.price) {
      alert('El precio es requerido');
      return;
    }
    if (!f.duration) {
      alert('La duración es requerida');
      return;
    }

    const payload: ServiceCreateDTO = {
      companyId: Number(this.companyId),
      supplierId: Number(this.supplierId),
      name: f.name,
      description: f.description || '',
      price: Number(f.price),
      duration: Number(f.duration),
      status: f.status || 'ACTIVE'
    };

    this.loading = true;
    this.servicesService.create(payload).subscribe({
      next: () => {
        this.modalOpen = false;
        this.loading = false;
        this.loadServices();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating service:', err);
        alert('❌ ' + (err.error?.message || 'Error al crear el servicio'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== MODAL - EDICIÓN ====================
  onEdit(service: ServiceDTO): void {
    if (!this.hasUpdatePermission) return;

    this.isEditMode = true;
    this.editServiceId = service.id;
    this.editForm = {
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      status: service.status
    };
    this.editModalOpen = true;
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.editServiceId = null;
  }

  updateService(): void {
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

    this.loading = true;
    this.servicesService.patch(this.editServiceId, payload).subscribe({
      next: () => {
        this.editModalOpen = false;
        this.editServiceId = null;
        this.loading = false;
        this.loadServices();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating service:', err);
        alert('❌ ' + (err.error?.message || 'Error al actualizar el servicio'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== MODAL - ELIMINACIÓN ====================
  onDelete(service: ServiceDTO): void {
    if (!this.hasDeletePermission) return;
    this.serviceToDelete = service;
    this.deleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
    this.serviceToDelete = null;
  }

  confirmDelete(): void {
    if (!this.serviceToDelete) return;

    this.loading = true;
    this.servicesService.delete(this.serviceToDelete.id).subscribe({
      next: () => {
        this.deleteModalOpen = false;
        this.serviceToDelete = null;
        this.loading = false;
        this.loadServices();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting service:', err);
        alert('❌ ' + (err.error?.message || 'Error al eliminar el servicio'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== HELPERS ====================
  private createEmptyForm(): ServiceForm {
    return {
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

  reload(): void {
    this.loadServices();
  }
}