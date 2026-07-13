// my-schedule/components/availabilities/availabilities.component.ts
import { Component, OnInit, inject, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvailabilityService } from '../../../../services/availability/availability';
import { 
  AvailabilityDTO, 
  AvailabilityCreateDTO, 
  AvailabilityPatchDTO,
  AvailabilityEvent
} from '../../../../models/availability';
import { LucideAngularModule } from 'lucide-angular';
import { AvailabilitiesHeader} from './components/availabilities-header/availabilities-header';
import { AvailabilitiesList} from './components/availabilities-list/availabilities-list';
import { AvailabilitiesForm} from './components/availabilities-form/availabilities-form';
import { AvailabilitiesDeleteModal} from './components/availabilities-delete-modal/availabilities-delete-modal';
import { AvailabilitiesCalendar} from './components/availabilities-calendar/availabilities-calendar';

type ViewMode = 'list' | 'calendar';
type CalendarViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-availabilities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AvailabilitiesHeader,
    AvailabilitiesList,
    AvailabilitiesForm,
    AvailabilitiesDeleteModal,
    AvailabilitiesCalendar
  ],
  templateUrl: './availabilities.html',
  styleUrls: ['./availabilities.scss']
})
export class AvailabilitiesComponent implements OnInit, OnChanges {
  // ==================== INPUTS ====================
  @Input() supplierId: number | null = null;
  @Input() companyId: number | null = null;
  @Input() hasCreatePermission = false;
  @Input() hasReadPermission = false;
  @Input() hasUpdatePermission = false;
  @Input() hasDeletePermission = false;

  // ==================== INYECCIONES ====================
  private availabilityService = inject(AvailabilityService);
  private cdr = inject(ChangeDetectorRef);

  // ==================== ESTADO ====================
  loading = false;
  error: string | null = null;

  // ==================== DATOS ====================
  availabilities: AvailabilityDTO[] = [];
  filteredAvailabilities: AvailabilityDTO[] = [];
  
  // ==================== CALENDARIO ====================
  events: AvailabilityEvent[] = [];
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  calendarViewMode: CalendarViewMode = 'week';
  viewMode: ViewMode = 'calendar';

  // ==================== MODALES ====================
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  createFormData: AvailabilityCreateDTO | null = null;
  editData: AvailabilityDTO | null = null;
  showDeleteModal = false;
  availabilityToDelete: AvailabilityDTO | null = null;

  // ==================== GETTERS ====================
  get totalSchedules(): number { return this.filteredAvailabilities.length; }
  get canCreate(): boolean { return this.hasCreatePermission && !!this.supplierId; }
  get canRead(): boolean { return this.hasReadPermission && !!this.supplierId; }

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplierId'] && this.supplierId) {
      this.loadAvailabilities(this.supplierId);
    }
  }

  // ==================== CARGAR DISPONIBILIDADES ====================
  private loadAvailabilities(supplierId: number): void {
    if (!this.canRead) {
      this.availabilities = [];
      this.filteredAvailabilities = [];
      this.events = [];
      return;
    }

    this.loading = true;
    this.error = null;

    this.availabilityService.getAllBySupplier(supplierId).subscribe({
      next: data => {
        this.availabilities = data;
        this.filteredAvailabilities = data;
        this.events = this.generateCalendarEvents(data);
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
  private generateCalendarEvents(availabilities: AvailabilityDTO[]): AvailabilityEvent[] {
    const events: AvailabilityEvent[] = [];
    const startDate = new Date(this.currentDate);
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date(this.currentDate);
    endDate.setMonth(endDate.getMonth() + 2);

    for (const availability of availabilities) {
      if (availability.status !== 'ACTIVE') continue;

      const baseStart = new Date(availability.startDate);
      const baseEnd = availability.endDate ? new Date(availability.endDate) : new Date(2099, 11, 31);
      
      if (baseEnd < startDate || baseStart > endDate) continue;

      const recurrence = availability.recurrenceType;
      
      if (recurrence === 'NONE') {
        const event = this.createEventFromAvailability(availability);
        if (event && this.isDateInRange(event.start, startDate, endDate)) {
          events.push(event);
        }
      } else if (recurrence === 'DAILY') {
        const current = new Date(Math.max(baseStart.getTime(), startDate.getTime()));
        while (current <= baseEnd && current <= endDate) {
          const event = this.createEventFromAvailability(availability, current);
          if (event) events.push(event);
          current.setDate(current.getDate() + 1);
        }
      } else if (recurrence === 'WEEKLY') {
        const current = new Date(Math.max(baseStart.getTime(), startDate.getTime()));
        while (current <= baseEnd && current <= endDate) {
          const dayOfWeek = current.getDay();
          if (this.isDayActive(availability, dayOfWeek)) {
            const event = this.createEventFromAvailability(availability, current);
            if (event) events.push(event);
          }
          current.setDate(current.getDate() + 1);
        }
      } else if (recurrence === 'MONTHLY') {
        const current = new Date(Math.max(baseStart.getTime(), startDate.getTime()));
        const dayOfMonth = baseStart.getDate();
        current.setDate(dayOfMonth);
        while (current <= baseEnd && current <= endDate) {
          const event = this.createEventFromAvailability(availability, current);
          if (event) events.push(event);
          current.setMonth(current.getMonth() + 1);
        }
      }
    }

    return events;
  }


private createEventFromAvailability(
  availability: AvailabilityDTO,
  date?: Date
): AvailabilityEvent | null {
  // Obtener fechas como strings
  const startDateStr = availability.startDate;
  const endDateStr = availability.endDate || availability.startDate;
  
  // Si se proporciona una fecha específica (para recurrencias), usarla
  let startDate: Date;
  let endDate: Date;
  
  if (date) {
    // Para recurrencias: usar la fecha proporcionada
    startDate = new Date(date);
    endDate = new Date(date);
  } else {
    // Para eventos puntuales: crear desde el string sin offset de zona horaria
    startDate = new Date(startDateStr + 'T00:00:00');
    endDate = new Date(endDateStr + 'T00:00:00');
  }
  
  // Extraer horas y minutos del string de tiempo
  const [startHour, startMinute] = availability.startTime.split(':').map(Number);
  const [endHour, endMinute] = availability.endTime.split(':').map(Number);
  
  // Aplicar hora al inicio
  const start = new Date(startDate);
  start.setHours(startHour, startMinute, 0, 0);
  
  // Aplicar hora al fin
  const end = new Date(endDate);
  end.setHours(endHour, endMinute, 0, 0);

  return {
    id: availability.id,
    supplierId: availability.supplierId,
    supplierName: availability.supplierName || 'Supplier',
    title: `Disponible`,
    start: start,
    end: end,
    color: '#7C6EF5'
  };
}

  private isDayActive(availability: AvailabilityDTO, dayOfWeek: number): boolean {
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

  // ==================== NAVEGACIÓN DEL CALENDARIO ====================
  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    if (this.supplierId) {
      this.loadAvailabilities(this.supplierId);
    }
    this.cdr.detectChanges();
  }

  previousDate(): void {
    if (this.calendarViewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else if (this.calendarViewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else if (this.calendarViewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    if (this.supplierId) {
      this.loadAvailabilities(this.supplierId);
    }
    this.cdr.detectChanges();
  }

  nextDate(): void {
    if (this.calendarViewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else if (this.calendarViewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else if (this.calendarViewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    if (this.supplierId) {
      this.loadAvailabilities(this.supplierId);
    }
    this.cdr.detectChanges();
  }

  setCalendarView(mode: CalendarViewMode): void {
    this.calendarViewMode = mode;
    if (this.supplierId) {
      this.loadAvailabilities(this.supplierId);
    }
    this.cdr.detectChanges();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    if (this.calendarViewMode === 'month' || this.calendarViewMode === 'week') {
      this.calendarViewMode = 'day';
    }
    this.cdr.detectChanges();
  }

  // ==================== MODAL - CREACIÓN ====================
  onAddClick(): void {
    if (!this.canCreate) return;

    this.modalMode = 'create';
    this.editData = null;
    
    this.createFormData = {
      companyId: this.companyId || 0,
      supplierId: this.supplierId || 0,
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

  openEditModal(availability: AvailabilityDTO): void {
    if (!this.hasUpdatePermission) return;
    
    this.modalMode = 'edit';
    this.editData = availability;
    this.createFormData = null;
    this.showModal = true;
  }

  openDeleteModal(availability: AvailabilityDTO): void {
    if (!this.hasDeletePermission) return;
    this.availabilityToDelete = availability;
    this.showDeleteModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.createFormData = null;
    this.editData = null;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.availabilityToDelete = null;
  }

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
    if (!this.supplierId) return;

    if (!formData.companyId || formData.companyId === 0) {
      formData.companyId = this.companyId || 0;
    }
    
    this.loading = true;
    this.availabilityService.create(formData).subscribe({
      next: () => {
        this.showModal = false;
        this.loading = false;
        if (this.supplierId) {
          this.loadAvailabilities(this.supplierId);
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
        if (this.supplierId) {
          this.loadAvailabilities(this.supplierId);
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
        if (this.supplierId) {
          this.loadAvailabilities(this.supplierId);
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

  reload(): void {
    if (this.supplierId) {
      this.loadAvailabilities(this.supplierId);
    }
  }
}