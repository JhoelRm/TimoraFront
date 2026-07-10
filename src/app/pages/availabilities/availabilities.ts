// pages/availability/availabilities.ts
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvailabilityService } from '../../services/availability/availability';
import { PersonService } from '../../services/person-identity/person-identity';
import { AuthService } from '../../services/auth/auth';
import { CompaniesService } from '../../services/companies/companies';
import { AvailabilityDTO, AvailabilityEvent, AvailabilityCreateDTO, AvailabilityPatchDTO } from '../../models/availability';
import { PersonIdentityDTO } from '../../models/person-identity';
import { CurrentUser } from '../../models/currentUser';
import { CompanyDTO } from '../../models/company';
import { LucideAngularModule, X } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AvailabilitiesFilter } from './components/availabilities-filter/availabilities-filter';
import { AvailabilitiesList } from './components/availabilities-list/availabilities-list';
import { AvailabilitiesCalendar } from './components/availabilities-calendar/availabilities-calendar';
import { AvailabilitiesForm } from './components/availabilities-form/availabilities-form';

type ViewMode = 'list' | 'calendar';
type CalendarViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DialogModule, ButtonModule, AvailabilitiesFilter, AvailabilitiesList, AvailabilitiesCalendar, AvailabilitiesForm],
  templateUrl: './availabilities.html',
  styleUrls: ['./availabilities.scss']
})
export class AvailabilitiesComponent implements OnInit {
  icons = { X };
  
  // Estado
  viewMode: ViewMode = 'calendar';
  calendarViewMode: CalendarViewMode = 'week';
  availabilities: AvailabilityDTO[] = [];
  filteredAvailabilities: AvailabilityDTO[] = [];
  loading = false;
  error: string | null = null;

  // Fechas
  currentDate = new Date();
  selectedDate = new Date();

  // Eventos para el calendario
  events: AvailabilityEvent[] = [];

  // Usuario actual
  currentUser: CurrentUser | null = null;
  currentUserSupplier: PersonIdentityDTO | null = null;
  currentCompany: CompanyDTO | null = null;

  // Companies
  allCompanies: CompanyDTO[] = [];
  selectedCompanyId: number | null = null;

  // Suppliers
  allSuppliers: PersonIdentityDTO[] = [];
  filteredSuppliers: PersonIdentityDTO[] = [];
  selectedSupplierId: number | null = null;

  // Modal
  modalOpen = false;
  editModalOpen = false;
  deleteModalOpen = false;
  isEditMode = false;
  editAvailabilityId: number | null = null;
  availabilityToDelete: AvailabilityDTO | null = null;

  // Formularios
  availabilityForm: AvailabilityCreateDTO = this.createEmptyForm();
  editForm: AvailabilityPatchDTO = {};

  // Inyecci├│n de dependencias
  private availabilityService = inject(AvailabilityService);
  private personService = inject(PersonService);
  private authService = inject(AuthService);
  private companiesService = inject(CompaniesService);
  private cdr = inject(ChangeDetectorRef);

  // Getters
  get isOwner() { return this.currentUser?.role === 'OWNER'; }
  get isAdmin() { return this.currentUser?.role === 'ADMIN'; }
  get isUser() { return this.currentUser?.role === 'USER'; }
  get canSelectCompany() { return this.isOwner; }
  get canSelectSupplier() { return this.isOwner || this.isAdmin; }

  get totalSchedules(): number {
    return this.filteredAvailabilities.length;
  }

  setViewMode(mode: ViewMode): void {
    this.setView(mode);
  }

  get supplierOptions(): PersonIdentityDTO[] {
    return this.filteredSuppliers;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadCompanies();
    this.loadSuppliers();
  }

  // ==================== LOAD DATA ====================

  private loadCompanies(): void {
    this.companiesService.getAll().subscribe({
      next: (companies) => {
        this.allCompanies = companies ?? [];
        
        // Si es OWNER, seleccionar su compa├▒├¡a por defecto
        if (this.isOwner && this.currentUser?.companyId) {
          this.selectedCompanyId = this.currentUser.companyId;
        }
        
        this.onCompanyChange(this.selectedCompanyId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  private loadSuppliers(): void {
    this.personService.getAll().subscribe({
      next: (data) => {
        let suppliers = (data ?? []).filter(x => x.supplier !== null && x.supplier !== undefined);
        
        // Filtrar por rol
        if (this.isUser && this.currentUser) {
          suppliers = suppliers.filter(s => s.person.id === this.currentUser?.personId);
        }
        
        this.allSuppliers = suppliers;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading suppliers:', err);
      }
    });
  }

  private loadCurrentUserSupplier(): void {
    if (!this.currentUser) return;
    this.personService.getById(this.currentUser.personId).subscribe({
      next: (person) => {
        if (person.supplier) {
          this.currentUserSupplier = person;
          this.selectedSupplierId = person.supplier.id;
          this.loadAvailabilities();
        }
        this.cdr.detectChanges();
      },
      error: console.error
    });
  }

loadAvailabilities(): void {
  // Si es USER, usar su supplier autom├íticamente
  if (this.isUser) {
    if (!this.currentUserSupplier) {
      this.loadCurrentUserSupplier();
      return;
    }
    // Si el supplier no est├í seleccionado, seleccionarlo
    if (!this.selectedSupplierId && this.currentUserSupplier) {
      this.selectedSupplierId = this.currentUserSupplier.supplier?.id ?? null;
    }
  }

  if (!this.selectedSupplierId && !this.isUser) {
    this.filteredAvailabilities = [];
    this.events = [];
    return;
  }
  
  this.loading = true;
  this.error = null;
  
  let supplierId: number | null = null;
  
  // Si es USER, usar su supplier
  if (this.isUser && this.currentUserSupplier) {
    supplierId = this.currentUserSupplier.supplier?.id ?? null;
  } else {
    supplierId = this.selectedSupplierId;
  }

  if (!supplierId) {
    this.loading = false;
    return;
  }

  // Asegurar que el supplierId sea un n├║mero
  const id = Number(supplierId);
  if (isNaN(id)) {
    this.loading = false;
    this.error = 'Invalid supplier ID';
    return;
  }

  this.availabilityService.getAllBySupplier(id).subscribe({
    next: (data) => {
      this.availabilities = data;
      this.filteredAvailabilities = data;
      this.events = this.convertToEvents(data);
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error loading availabilities:', err);
      this.error = 'Failed to load availabilities';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}
  // ==================== FILTERS ====================

// ==================== FILTERS ====================

private applyFilters(): void {
  // Aplicar filtro de compa├▒├¡a
  let suppliers = this.allSuppliers;
  
  // Filtro por compa├▒├¡a (solo OWNER)
  if (this.canSelectCompany && this.selectedCompanyId) {
    suppliers = suppliers.filter(s => s.person.companyId === this.selectedCompanyId);
  }
  
  // Para ADMIN, mostrar solo suppliers de su compa├▒├¡a
  if (this.isAdmin) {
    const companyId = this.currentUser?.companyId;
    if (companyId) {
      suppliers = suppliers.filter(s => s.person.companyId === companyId);
    }
  }
  
  this.filteredSuppliers = suppliers;
  
  // Si no hay suppliers seleccionados o el seleccionado ya no est├í disponible
  if (this.selectedSupplierId) {
    const stillExists = this.filteredSuppliers.some(s => s.supplier?.id === this.selectedSupplierId);
    if (!stillExists) {
      this.selectedSupplierId = null;
      this.filteredAvailabilities = [];
      this.events = [];
    }
  }
  
  // Si es USER, cargar su supplier
  if (this.isUser) {
    this.loadCurrentUserSupplier();
  }
  
  this.cdr.detectChanges();
}
  onCompanyChange(companyId: number | null): void {
    this.selectedCompanyId = companyId;
    this.applyFilters();
    this.selectedSupplierId = null;
    this.filteredAvailabilities = [];
    this.events = [];
    this.cdr.detectChanges();
  }

  onSupplierChange(supplierId: number | null): void {
    this.selectedSupplierId = supplierId;
    this.loadAvailabilities();
  }

  // ==================== EVENTS CONVERSION ====================

  convertToEvents(data: AvailabilityDTO[]): AvailabilityEvent[] {
    return data.map(item => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const [startHour, startMinute] = item.startTime.split(':').map(Number);
      const [endHour, endMinute] = item.endTime.split(':').map(Number);
      
      const startDate = new Date(start);
      startDate.setHours(startHour, startMinute, 0, 0);
      
      const endDate = new Date(end);
      endDate.setHours(endHour, endMinute, 0, 0);

      return {
        id: item.id,
        supplierId: item.supplierId,
        supplierName: item.supplierName || `Supplier ${item.supplierId}`,
        title: `${item.supplierName || `Supplier ${item.supplierId}`} - Available`,
        start: startDate,
        end: endDate,
        color: '#7C6EF5'
      };
    });
  }

  // ==================== NAVIGATION ====================

  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.updateView();
  }

  previous(): void {
    if (this.calendarViewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else if (this.calendarViewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else if (this.calendarViewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.updateView();
  }

  next(): void {
    if (this.calendarViewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else if (this.calendarViewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else if (this.calendarViewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.updateView();
  }

  updateView(): void {
    this.cdr.detectChanges();
  }

  // ==================== VIEW MODE ====================

  setView(mode: ViewMode): void {
    this.viewMode = mode;
    if (mode === 'calendar') {
      this.calendarViewMode = 'week';
    }
    this.updateView();
  }

  setCalendarView(mode: CalendarViewMode): void {
    this.calendarViewMode = mode;
    this.updateView();
  }

  // ==================== CALENDAR HELPERS ====================

  getDateDisplay(): string {
    const date = this.currentDate;
    if (this.calendarViewMode === 'day') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    } else if (this.calendarViewMode === 'week') {
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay() + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ÔÇô ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (this.calendarViewMode === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return '';
  }

  getWeekDays(): Date[] {
    const start = new Date(this.currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }

  getMonthDays(): (Date | null)[][] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }

  getDayEvents(date: Date): AvailabilityEvent[] {
    const dateStr = date.toDateString();
    return this.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === dateStr;
    });
  }

  getEventStyle(event: AvailabilityEvent): { top: string; height: string } {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const hourHeight = 64;
    const top = (startHour - 6) * hourHeight;
    const height = (endHour - startHour) * hourHeight;
    return { top: `${top}px`, height: `${height}px` };
  }

  getCurrentTimePosition(): number {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    const baseHour = 6;
    const hourHeight = 64;
    return (hours - baseHour) * hourHeight;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelected(date: Date): boolean {
    return date.toDateString() === this.selectedDate.toDateString();
  }

  selectDay(date: Date): void {
    this.selectedDate = date;
    if (this.calendarViewMode === 'month' || this.calendarViewMode === 'week') {
      this.calendarViewMode = 'day';
    }
    this.cdr.detectChanges();
  }

  hasEvents(date: Date | null): boolean {
    if (!date) return false;
    return this.getDayEvents(date).length > 0;
  }

  getSupplierName(supplierId: number): string {
    const supplier = this.allSuppliers.find(s => s.supplier?.id === supplierId);
    return supplier ? `${supplier.person.firstName} ${supplier.person.lastName}` : `Supplier ${supplierId}`;
  }

  // ==================== FORM HELPERS ====================

// ==================== FORM HELPERS ====================

createEmptyForm(): AvailabilityCreateDTO {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  
  // Obtener el companyId del supplier seleccionado o del usuario actual
  let companyId = this.currentUser?.companyId || 0;
  
  // Si hay un supplier seleccionado, usar su compa├▒├¡a
  if (this.selectedSupplierId) {
    const selectedSupplier = this.allSuppliers.find(
      s => s.supplier?.id === this.selectedSupplierId
    );
    if (selectedSupplier) {
      companyId = selectedSupplier.person.companyId;
    }
  }
  
  return {
    companyId: companyId,
    supplierId: this.selectedSupplierId || 0,
    startDate: formattedDate,
    endDate: formattedDate,
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '18:00',
    slotDurationMinutes: 60,
    capacity: 1,
    recurrenceType: 'NONE',
    notes: ''
  };
}

  // ==================== CRUD OPERATIONS ====================

openCreateModal(): void {
  this.isEditMode = false;
  this.editAvailabilityId = null;
  this.availabilityForm = this.createEmptyForm();
  
  // Si es USER, usar su supplier
  if (this.isUser && this.currentUserSupplier) {
    const supplierId = this.currentUserSupplier.supplier?.id || 0;
    this.availabilityForm.supplierId = supplierId;
    // Asegurar que el companyId coincida con el supplier
    const supplier = this.allSuppliers.find(s => s.supplier?.id === supplierId);
    if (supplier) {
      this.availabilityForm.companyId = supplier.person.companyId;
    }
  } else if (this.selectedSupplierId) {
    this.availabilityForm.supplierId = this.selectedSupplierId;
    // Asegurar que el companyId coincida con el supplier seleccionado
    const supplier = this.allSuppliers.find(s => s.supplier?.id === this.selectedSupplierId);
    if (supplier) {
      this.availabilityForm.companyId = supplier.person.companyId;
    }
  }
  
  this.modalOpen = true;
  this.cdr.detectChanges();
}
  closeModal(): void {
    this.modalOpen = false;
  }

createAvailability(): void {
  const form = this.availabilityForm;
  
  if (form.supplierId === 0) {
    alert('Please select a supplier');
    return;
  }

  // Validar que el supplier pertenezca a la compa├▒├¡a seleccionada
  const supplier = this.allSuppliers.find(s => s.supplier?.id === form.supplierId);
  if (!supplier) {
    alert('Selected supplier not found');
    return;
  }

  // Asegurar que el companyId coincida con el supplier
  form.companyId = supplier.person.companyId;

  if (!form.companyId || form.companyId === 0) {
    alert('Company ID is required');
    return;
  }

  // Validar fechas
  const startDate = new Date(form.startDate);
  const endDate = new Date(form.endDate);
  if (endDate < startDate) {
    alert('End date must be after start date');
    return;
  }

  // Validar horas
  const [startHour, startMinute] = form.startTime.split(':').map(Number);
  const [endHour, endMinute] = form.endTime.split(':').map(Number);
  if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
    alert('End time must be after start time');
    return;
  }

  this.loading = true;
  this.availabilityService.create(form).subscribe({
    next: () => {
      this.modalOpen = false;
      this.loadAvailabilities();
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error creating availability:', err);
      alert('Failed to create availability: ' + (err.error?.message || err.message));
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  openEditModal(availability: AvailabilityDTO): void {
    this.isEditMode = true;
    this.editAvailabilityId = availability.id;
    this.editForm = {
      startDate: availability.startDate,
      endDate: availability.endDate,
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      slotDurationMinutes: availability.slotDurationMinutes,
      capacity: availability.capacity,
      recurrenceType: availability.recurrenceType,
      status: availability.status,
      notes: availability.notes
    };
    this.editModalOpen = true;
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.editAvailabilityId = null;
  }
updateAvailability(): void {
  if (!this.editAvailabilityId) return;

  // Asegurar que el ID sea un n├║mero
  const id = Number(this.editAvailabilityId);
  
  if (isNaN(id)) {
    alert('Invalid availability ID');
    return;
  }

  this.loading = true;
  this.availabilityService.patch(id, this.editForm).subscribe({
    next: () => {
      this.editModalOpen = false;
      this.editAvailabilityId = null;
      this.loadAvailabilities();
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error updating availability:', err);
      alert('Failed to update availability: ' + (err.error?.message || err.message));
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  openDeleteModal(availability: AvailabilityDTO): void {
    this.availabilityToDelete = availability;
    this.deleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
    this.availabilityToDelete = null;
  }

confirmDelete(): void {
  if (!this.availabilityToDelete) return;

  this.loading = true;
  // Asegurar que el ID sea un n├║mero
  const id = Number(this.availabilityToDelete.id);
  
  if (isNaN(id)) {
    alert('Invalid availability ID');
    this.loading = false;
    return;
  }

  this.availabilityService.delete(id).subscribe({
    next: () => {
      this.deleteModalOpen = false;
      this.availabilityToDelete = null;
      this.loadAvailabilities();
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error deleting availability:', err);
      alert('Failed to delete availability: ' + (err.error?.message || err.message));
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  trackBySupplierId(index: number, item: PersonIdentityDTO): number {
    return item.supplier?.id ?? index;
  }

  trackByAvailabilityId(index: number, item: AvailabilityDTO): number {
    return item.id;
  }

  trackByEventId(index: number, item: AvailabilityEvent): number {
    return item.id;
  }

  trackByCompanyId(index: number, item: CompanyDTO): number {
    return item.id;
  }
}
