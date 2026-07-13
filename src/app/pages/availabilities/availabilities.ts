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
  AvailabilityEvent,
  AvailabilityRecurring
} from '../../models/availability';
import { PersonIdentityDTO } from '../../models/person-identity';
import { CurrentUser } from '../../models/currentUser';
import { CompanyDTO } from '../../models/company';
import { LucideAngularModule } from 'lucide-angular';
import { AvailabilitiesFilter } from './components/availabilities-filter/availabilities-filter';
import { AvailabilitiesList } from './components/availabilities-list/availabilities-list';
import { AvailabilitiesForm } from './components/availabilities-form/availabilities-form';
import { AvailabilitiesDeleteModal } from './components/availabilities-delete-modal/availabilities-delete-modal';
import { AvailabilitiesCalendar } from './components/availabilities-calendar/availabilities-calendar';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

type ViewMode = 'list' | 'calendar';
type CalendarViewMode = 'day' | 'week' | 'month';

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
    AvailabilitiesDeleteModal,
    AvailabilitiesCalendar
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
  
  // ==================== CALENDARIO ====================
  events: AvailabilityEvent[] = [];
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  calendarViewMode: CalendarViewMode = 'week';
  
  // ==================== FILTROS SELECCIONADOS ====================
  selectedCompanyId: number | null = null;
  selectedSupplierId: number | null = null;
  viewMode: ViewMode = 'calendar'; // Cambiado a calendar por defecto

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
      this.allCompanies = (data ?? []).filter(c => c.status === 'ACTIVE');
      console.log('🏢 Compañías activas cargadas:', this.allCompanies.length);
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

    if (this.selectedSupplierId && !this.isUser) {
      const stillExists = suppliers.some(s => s.supplier?.id === this.selectedSupplierId);
      if (!stillExists) {
        console.log('⚠️ Supplier seleccionado ya no existe, limpiando...');
        this.selectedSupplierId = null;
      }
    }

    this.filteredSuppliers = suppliers;
    
    if (this.selectedSupplierId) {
      this.loadAvailabilities(this.selectedSupplierId);
    } else {
      this.filteredAvailabilities = [];
      this.events = [];
      this.loading = false;
    }
    
    console.log('📊 Suppliers filtrados:', this.filteredSuppliers.length);
    console.log('✅ Supplier seleccionado final:', this.selectedSupplierId);
    this.cdr.detectChanges();
  }

  // ==================== CARGAR DISPONIBILIDADES ====================
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
        
        // 🔴 Generar eventos para el calendario con soporte para recurrencias
        this.events = this.generateCalendarEvents(this.availabilities, supplierName);
        
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

  // ==================== GENERAR EVENTOS DEL CALENDARIO ====================
private generateCalendarEvents(
  availabilities: AvailabilityDTO[], 
  supplierName?: string
): AvailabilityEvent[] {
  const events: AvailabilityEvent[] = [];
  const startDate = new Date(this.currentDate);
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date(this.currentDate);
  endDate.setMonth(endDate.getMonth() + 2);

  for (const availability of availabilities) {
    if (availability.status !== 'ACTIVE') continue;

    const name = supplierName || availability.supplierName || `Supplier ${availability.supplierId}`;
    
    // 🔴 CORRECCIÓN: Crear fechas desde strings sin offset
    const baseStart = new Date(availability.startDate + 'T00:00:00');
    const baseEnd = availability.endDate 
      ? new Date(availability.endDate + 'T00:00:00') 
      : new Date(2099, 11, 31);
    
    if (baseEnd < startDate || baseStart > endDate) continue;

    const recurrence = availability.recurrenceType;
    
    if (recurrence === 'NONE') {
      const event = this.createEventFromAvailability(availability, name);
      if (event && this.isDateInRange(event.start, startDate, endDate)) {
        events.push(event);
      }
    } else if (recurrence === 'DAILY') {
      const current = new Date(Math.max(baseStart.getTime(), startDate.getTime()));
      while (current <= baseEnd && current <= endDate) {
        const event = this.createEventFromAvailability(availability, name, current);
        if (event) events.push(event);
        current.setDate(current.getDate() + 1);
      }
    } else if (recurrence === 'WEEKLY') {
      const current = new Date(Math.max(baseStart.getTime(), startDate.getTime()));
      while (current <= baseEnd && current <= endDate) {
        const dayOfWeek = current.getDay();
        const isActive = this.isDayActive(availability, dayOfWeek);
        if (isActive) {
          const event = this.createEventFromAvailability(availability, name, current);
          if (event) events.push(event);
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (recurrence === 'MONTHLY') {
      const current = new Date(Math.max(baseStart.getTime(), startDate.getTime()));
      const dayOfMonth = baseStart.getDate();
      current.setDate(dayOfMonth);
      while (current <= baseEnd && current <= endDate) {
        const event = this.createEventFromAvailability(availability, name, current);
        if (event) events.push(event);
        current.setMonth(current.getMonth() + 1);
      }
    } else if (recurrence === 'YEARLY') {
      const current = new Date(Math.max(baseStart.getTime(), startDate.getTime()));
      const month = baseStart.getMonth();
      const day = baseStart.getDate();
      current.setMonth(month);
      current.setDate(day);
      while (current <= baseEnd && current <= endDate) {
        const event = this.createEventFromAvailability(availability, name, current);
        if (event) events.push(event);
        current.setFullYear(current.getFullYear() + 1);
      }
    }
  }

  return events;
}

private createEventFromAvailability(
  availability: AvailabilityDTO,
  supplierName: string,
  date?: Date
): AvailabilityEvent | null {
  // 🔴 CORRECCIÓN: Usar string + T00:00:00 para evitar offset de zona horaria
  let startDate: Date;
  let endDate: Date;
  
  if (date) {
    // Para recurrencias: usar la fecha proporcionada
    startDate = new Date(date);
    endDate = new Date(date);
  } else {
    // Para eventos puntuales: crear desde el string sin offset de zona horaria
    startDate = new Date(availability.startDate + 'T00:00:00');
    endDate = new Date((availability.endDate || availability.startDate) + 'T00:00:00');
  }
  
  const [startHour, startMinute] = availability.startTime.split(':').map(Number);
  const [endHour, endMinute] = availability.endTime.split(':').map(Number);
  
  const start = new Date(startDate);
  start.setHours(startHour, startMinute, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(endHour, endMinute, 0, 0);

  return {
    id: availability.id,
    supplierId: availability.supplierId,
    supplierName: supplierName,
    title: `${supplierName} - Disponible`,
    start: start,
    end: end,
    color: '#7C6EF5'
  };
}

  private isDayActive(availability: AvailabilityDTO, dayOfWeek: number): boolean {
    // dayOfWeek: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    const dayMap: Record<number, keyof AvailabilityDTO> = {
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
      0: 'sunday'
    };
    const key = dayMap[dayOfWeek];
    return !!availability[key];
  }

  private isDateInRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
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

  // ==================== NAVEGACIÓN DEL CALENDARIO ====================
  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    // Recargar eventos
    if (this.selectedSupplierId) {
      this.loadAvailabilities(this.selectedSupplierId);
    }
    this.cdr.detectChanges();
  }

  previous(): void {
    if (this.calendarViewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else if (this.calendarViewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else if (this.calendarViewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    // Recargar eventos
    if (this.selectedSupplierId) {
      this.loadAvailabilities(this.selectedSupplierId);
    }
    this.cdr.detectChanges();
  }

  next(): void {
    if (this.calendarViewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else if (this.calendarViewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else if (this.calendarViewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    // Recargar eventos
    if (this.selectedSupplierId) {
      this.loadAvailabilities(this.selectedSupplierId);
    }
    this.cdr.detectChanges();
  }

  setCalendarView(mode: CalendarViewMode): void {
    this.calendarViewMode = mode;
    if (this.selectedSupplierId) {
      this.loadAvailabilities(this.selectedSupplierId);
    }
    this.cdr.detectChanges();
  }

  selectDay(date: Date): void {
    this.selectedDate = date;
    if (this.calendarViewMode === 'month' || this.calendarViewMode === 'week') {
      this.calendarViewMode = 'day';
    }
    this.cdr.detectChanges();
  }

  // ==================== MODAL - CREACIÓN ====================
  onAddClick(): void {
    this.modalMode = 'create';
    this.editData = null;
    
    let defaultSupplierId = this.selectedSupplierId || 0;
    let defaultCompanyId = this.currentUser?.companyId || 0;
    
    if (this.isUser && this.currentUser?.personId) {
      const userSupplier = this.allSuppliers.find(s => s.person.id === this.currentUser?.personId);
      if (userSupplier) {
        defaultSupplierId = userSupplier.supplier?.id || 0;
        defaultCompanyId = userSupplier.person.companyId;
      }
    } else if (this.isAdminAndSupplier && !defaultSupplierId) {
      const userSupplier = this.allSuppliers.find(s => s.person.id === this.currentUser?.personId);
      if (userSupplier) {
        defaultSupplierId = userSupplier.supplier?.id || 0;
        defaultCompanyId = userSupplier.person.companyId;
      }
    } else if (defaultSupplierId > 0) {
      const selectedSupplier = this.allSuppliers.find(s => s.supplier?.id === defaultSupplierId);
      if (selectedSupplier) {
        defaultCompanyId = selectedSupplier.person.companyId;
      }
    }
    
    if (defaultCompanyId === 0 && this.selectedCompanyId) {
      defaultCompanyId = this.selectedCompanyId;
    }
    
    if (defaultCompanyId === 0 && this.currentUser?.companyId) {
      defaultCompanyId = this.currentUser.companyId;
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

  // ==================== MODAL - CERRAR ====================
  closeModal(): void {
    this.showModal = false;
    this.createFormData = null;
    this.editData = null;
  }

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

  confirmDelete(): void {
    if (!this.availabilityToDelete) return;
    this.deleteAvailability(this.availabilityToDelete.id);
  }

  // ==================== CRUD ====================
  createAvailability(formData: AvailabilityCreateDTO): void {
    if (!formData.companyId || formData.companyId === 0) {
      const supplier = this.allSuppliers.find(s => s.supplier?.id === formData.supplierId);
      if (supplier) {
        formData.companyId = supplier.person.companyId;
      } else {
        alert('❌ Error: No se pudo determinar la compañía.');
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
        alert('❌ ' + (err.error?.message || 'Error al crear la disponibilidad'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateAvailability(id: number, data: AvailabilityPatchDTO): void {
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
        alert('❌ ' + (err.error?.message || 'Error al actualizar la disponibilidad'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteAvailability(id: number): void {
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
        alert('❌ ' + (err.error?.message || 'Error al eliminar la disponibilidad'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}