// pages/availability/availabilities.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvailabilityService } from '../../services/availability/availability';
import { PersonService } from '../../services/person-identity/person-identity';
import { AuthService } from '../../services/auth/auth';
import { CompaniesService } from '../../services/companies/companies';
import { 
  AvailabilityDTO, 
  AvailabilityCreateDTO, 
  AvailabilityPatchDTO,
  toAvailabilityEvent 
} from '../../models/availability';
import { PersonIdentityDTO } from '../../models/person-identity';
import { CurrentUser } from '../../models/currentUser';
import { CompanyDTO } from '../../models/company';
import { LucideAngularModule } from 'lucide-angular';
import { AvailabilitiesFilter } from './components/availabilities-filter/availabilities-filter';
import { AvailabilitiesList } from './components/availabilities-list/availabilities-list';
import { AvailabilitiesForm } from './components/availabilities-form/availabilities-form';
import { AvailabilitiesDeleteModal } from './components/availabilities-delete-modal/availabilities-delete-modal';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

type ViewMode = 'list' | 'calendar';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    DialogModule,
    ButtonModule,
    AvailabilitiesFilter,
    AvailabilitiesList,
    AvailabilitiesForm,
    AvailabilitiesDeleteModal
  ],
  templateUrl: './availabilities.html',
  styleUrls: ['./availabilities.scss']
})
export class AvailabilitiesComponent implements OnInit {
  // ==================== INYECCIONES ====================
  private availabilityService = inject(AvailabilityService);
  private personService = inject(PersonService);
  private authService = inject(AuthService);
  private companiesService = inject(CompaniesService);
  private cdr = inject(ChangeDetectorRef);

  // ==================== ESTADO ====================
  currentUser: CurrentUser | null = null;
  loading = false;
  ready = false;
  error: string | null = null;

  // ==================== DATOS ====================
  allCompanies: CompanyDTO[] = [];
  allSuppliers: PersonIdentityDTO[] = [];
  filteredSuppliers: PersonIdentityDTO[] = [];
  availabilities: AvailabilityDTO[] = [];
  filteredAvailabilities: AvailabilityDTO[] = [];
  
  // ==================== FILTROS SELECCIONADOS ====================
  selectedCompanyId: number | null = null;
  selectedSupplierId: number | null = null;
  viewMode: ViewMode = 'list';

  // ==================== MODAL DE CREACIÓN/EDICIÓN ====================
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  createFormData: AvailabilityCreateDTO | null = null;
  editData: AvailabilityDTO | null = null;

  // ==================== MODAL DE ELIMINACIÓN ====================
  showDeleteModal = false;
  availabilityToDelete: AvailabilityDTO | null = null;

  // ==================== GETTERS DE CONTEXTO ====================
  get isOwner(): boolean { return this.currentUser?.role === 'OWNER'; }
  get isAdmin(): boolean { return this.currentUser?.role === 'ADMIN'; }
  get isUser(): boolean { return this.currentUser?.role === 'USER'; }
  
  // 🔴 Verificar si el ADMIN también es supplier
  get isAdminAndSupplier(): boolean {
    if (!this.isAdmin) return false;
    if (!this.currentUser) return false;
    const userSupplier = this.allSuppliers.find(s => s.person.id === this.currentUser?.personId);
    return userSupplier !== undefined && userSupplier !== null;
  }
  
  // ==================== GETTERS DE UI ====================
  get canSelectCompany(): boolean { return this.isOwner; }
  get canSelectSupplier(): boolean { return this.isOwner || this.isAdmin; }
  get showCompanyFilter(): boolean { return this.isOwner; }
  get showSupplierFilter(): boolean { return this.isOwner || this.isAdmin; }
  get isReadOnly(): boolean { return false; }
  get totalSchedules(): number { return this.filteredAvailabilities.length; }

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    console.log('👤 Usuario actual:', {
      role: this.currentUser?.role,
      companyId: this.currentUser?.companyId,
      personId: this.currentUser?.personId,
      isAdminAndSupplier: this.isAdminAndSupplier
    });
    
    this.initContext();
    this.loadData();
  }

  // ==================== INICIALIZACIÓN ====================
  private initContext(): void {
    const user = this.currentUser;
    if (!user) return;

    if (this.isAdmin && user.companyId) {
      this.selectedCompanyId = user.companyId;
      console.log('🏢 ADMIN fijado a compañía:', this.selectedCompanyId);
    }
    
    if (this.isUser && user.personId) {
      console.log('👤 USER fijado a persona ID:', user.personId);
    }
  }

  // ==================== CARGA DE DATOS ====================
  private loadData(): void {
    if (this.isOwner) {
      this.loadCompanies();
    }
    this.loadSuppliers();
  }

  private loadCompanies(): void {
    this.companiesService.getAll().subscribe({
      next: data => {
        this.allCompanies = data ?? [];
        console.log('🏢 Compañías cargadas:', this.allCompanies.length);
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading companies:', err)
    });
  }

  private loadSuppliers(): void {
    this.loading = true;
    this.personService.getAll().subscribe({
      next: data => {
        this.allSuppliers = (data ?? []).filter(x => x.supplier !== null);
        console.log('👤 Suppliers totales:', this.allSuppliers.length);
        this.loading = false;
        this.ready = true;
        this.applyFiltersAndLoad();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading suppliers:', err);
        this.error = 'Failed to load suppliers';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== FILTROS ====================
  private applyFiltersAndLoad(): void {
    const user = this.currentUser;
    let suppliers = [...this.allSuppliers];
    
    // 1️⃣ FILTRO POR COMPAÑÍA (según rol)
    if (this.isOwner && this.selectedCompanyId) {
      suppliers = suppliers.filter(s => s.person.companyId === this.selectedCompanyId);
      console.log('🏢 OWNER - Filtrado por compañía:', this.selectedCompanyId);
    }
    
    if (this.isAdmin && user?.companyId) {
      suppliers = suppliers.filter(s => s.person.companyId === user.companyId);
      console.log('🏢 ADMIN - Filtrado por compañía:', user.companyId);
    }
    
    if (this.isUser && user?.personId) {
      suppliers = suppliers.filter(s => s.person.id === user.personId);
      console.log('👤 USER - Filtrado por persona:', user.personId);
      
      if (suppliers.length > 0 && suppliers[0].supplier?.id) {
        this.selectedSupplierId = suppliers[0].supplier.id;
        console.log('✅ USER - Supplier auto-seleccionado:', this.selectedSupplierId);
      }
    }

    // 2️⃣ VERIFICAR SUPPLIER SELECCIONADO
    if (this.selectedSupplierId && !this.isUser) {
      const stillExists = suppliers.some(s => s.supplier?.id === this.selectedSupplierId);
      if (!stillExists) {
        console.log('⚠️ Supplier seleccionado ya no existe, limpiando...');
        this.selectedSupplierId = null;
      }
    }

    this.filteredSuppliers = suppliers;
    
    // 3️⃣ CARGAR DISPONIBILIDADES
    if (this.selectedSupplierId) {
      this.loadAvailabilities(this.selectedSupplierId);
    } else {
      this.filteredAvailabilities = [];
      this.loading = false;
    }
    
    console.log('📊 Suppliers filtrados:', this.filteredSuppliers.length);
    console.log('✅ Supplier seleccionado final:', this.selectedSupplierId);
    this.cdr.detectChanges();
  }

  private loadAvailabilities(supplierId: number): void {
    this.loading = true;
    this.availabilityService.getAllBySupplier(supplierId).subscribe({
      next: data => {
        const supplier = this.allSuppliers.find(s => s.supplier?.id === supplierId);
        const supplierName = supplier ? `${supplier.person.firstName} ${supplier.person.lastName}` : undefined;
        
        this.availabilities = data.map(item => ({
          ...item,
          supplierName: supplierName || item.supplierName
        }));
        
        this.filteredAvailabilities = this.availabilities;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading availabilities:', err);
        this.error = 'Failed to load availabilities';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== EVENTOS DEL FILTRO ====================
  onCompanyChange(companyId: number | null): void {
    if (!this.isOwner) {
      console.warn('⚠️ Solo OWNER puede cambiar compañía');
      return;
    }
    this.selectedCompanyId = companyId;
    this.selectedSupplierId = null;
    this.applyFiltersAndLoad();
  }

  onSupplierChange(supplierId: number | null): void {
    if (this.isUser) {
      console.warn('⚠️ USER no puede cambiar supplier (está fijo)');
      return;
    }
    this.selectedSupplierId = supplierId;
    this.applyFiltersAndLoad();
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  // ==================== MODAL - CREACIÓN ====================
  onAddClick(): void {
    this.modalMode = 'create';
    this.editData = null;
    
    let defaultSupplierId = this.selectedSupplierId || 0;
    let defaultCompanyId = this.currentUser?.companyId || 0;
    
    console.log('🔍 Preparando creación con:', {
      selectedSupplierId: this.selectedSupplierId,
      defaultSupplierId,
      defaultCompanyId,
      currentUserCompanyId: this.currentUser?.companyId
    });
    
    // Si es USER, usar su supplier
    if (this.isUser && this.currentUser?.personId) {
      const userSupplier = this.allSuppliers.find(s => s.person.id === this.currentUser?.personId);
      if (userSupplier) {
        defaultSupplierId = userSupplier.supplier?.id || 0;
        defaultCompanyId = userSupplier.person.companyId;
        console.log('👤 USER - Supplier encontrado:', {
          supplierId: defaultSupplierId,
          companyId: defaultCompanyId
        });
      }
    } 
    // 🔴 Si es ADMIN y supplier, usar su supplier si no hay seleccionado
    else if (this.isAdminAndSupplier && !defaultSupplierId) {
      const userSupplier = this.allSuppliers.find(s => s.person.id === this.currentUser?.personId);
      if (userSupplier) {
        defaultSupplierId = userSupplier.supplier?.id || 0;
        defaultCompanyId = userSupplier.person.companyId;
        console.log('👤 ADMIN-SUPPLIER - Supplier encontrado:', {
          supplierId: defaultSupplierId,
          companyId: defaultCompanyId
        });
      }
    }
    else if (defaultSupplierId > 0) {
      const selectedSupplier = this.allSuppliers.find(s => s.supplier?.id === defaultSupplierId);
      if (selectedSupplier) {
        defaultCompanyId = selectedSupplier.person.companyId;
        console.log('🏢 Supplier seleccionado - Company ID:', defaultCompanyId);
      }
    }
    
    if (defaultCompanyId === 0 && this.selectedCompanyId) {
      defaultCompanyId = this.selectedCompanyId;
      console.log('🏢 Usando companyId de la compañía seleccionada:', defaultCompanyId);
    }
    
    if (defaultCompanyId === 0 && this.currentUser?.companyId) {
      defaultCompanyId = this.currentUser.companyId;
      console.log('🏢 Usando companyId del usuario:', defaultCompanyId);
    }
    
    this.createFormData = {
      companyId: defaultCompanyId,
      supplierId: defaultSupplierId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '09:00:00',
      endTime: '18:00:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      recurrenceType: 'WEEKLY',
      slotDurationMinutes: 60,
      capacity: 1,
      notes: ''
    };
    
    console.log('📝 Formulario de creación:', this.createFormData);
    this.showModal = true;
  }

  // ==================== MODAL - EDICIÓN ====================
  openEditModal(availability: AvailabilityDTO): void {
    this.modalMode = 'edit';
    this.editData = availability;
    this.createFormData = null;
    this.showModal = true;
  }

  // ==================== MODAL - ELIMINACIÓN ====================
  openDeleteModal(availability: AvailabilityDTO): void {
    this.availabilityToDelete = availability;
    this.showDeleteModal = true;
  }

  // ==================== MODAL - CERRAR CREACIÓN/EDICIÓN ====================
  closeModal(): void {
    this.showModal = false;
    this.createFormData = null;
    this.editData = null;
  }

  // ==================== MODAL - CERRAR ELIMINACIÓN ====================
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.availabilityToDelete = null;
  }

  // ==================== MODAL - GUARDAR ====================
  saveAvailability(data: AvailabilityCreateDTO | AvailabilityPatchDTO): void {
    if (this.modalMode === 'edit' && this.editData) {
      this.updateAvailability(this.editData.id, data as AvailabilityPatchDTO);
    } else {
      this.createAvailability(data as AvailabilityCreateDTO);
    }
  }

  // ==================== MODAL - CONFIRMAR ELIMINACIÓN ====================
  confirmDelete(): void {
    if (!this.availabilityToDelete) return;
    this.deleteAvailability(this.availabilityToDelete.id);
  }

  // ==================== CRUD - CREAR ====================
  createAvailability(formData: AvailabilityCreateDTO): void {
    console.log('📝 Creando disponibilidad:', formData);
    
    if (!formData.companyId || formData.companyId === 0) {
      const supplier = this.allSuppliers.find(s => s.supplier?.id === formData.supplierId);
      if (supplier) {
        formData.companyId = supplier.person.companyId;
        console.log('🔧 Company ID corregido desde supplier:', formData.companyId);
      } else {
        alert('❌ Error: No se pudo determinar la compañía. Por favor selecciona un proveedor válido.');
        return;
      }
    }
    
    this.loading = true;
    this.availabilityService.create(formData).subscribe({
      next: () => {
        this.showModal = false;
        this.loading = false;
        if (this.selectedSupplierId) {
          this.loadAvailabilities(this.selectedSupplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating availability:', err);
        let errorMessage = 'Error al crear la disponibilidad';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.errors) {
          errorMessage = Object.values(err.error.errors).join(', ');
        }
        alert('❌ ' + errorMessage);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== CRUD - ACTUALIZAR ====================
  updateAvailability(id: number, data: AvailabilityPatchDTO): void {
    console.log('✏️ Actualizando disponibilidad:', id, data);
    
    this.loading = true;
    this.availabilityService.patch(id, data).subscribe({
      next: () => {
        this.showModal = false;
        this.loading = false;
        if (this.selectedSupplierId) {
          this.loadAvailabilities(this.selectedSupplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating availability:', err);
        let errorMessage = 'Error al actualizar la disponibilidad';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.errors) {
          errorMessage = Object.values(err.error.errors).join(', ');
        }
        alert('❌ ' + errorMessage);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== CRUD - ELIMINAR ====================
  deleteAvailability(id: number): void {
    console.log('🗑️ Eliminando disponibilidad:', id);
    
    this.loading = true;
    this.availabilityService.delete(id).subscribe({
      next: () => {
        this.loading = false;
        this.showDeleteModal = false;
        this.availabilityToDelete = null;
        if (this.selectedSupplierId) {
          this.loadAvailabilities(this.selectedSupplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting availability:', err);
        let errorMessage = 'Error al eliminar la disponibilidad';
        if (err.error?.message) {
          errorMessage = err.error.message;
        }
        alert('❌ ' + errorMessage);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}