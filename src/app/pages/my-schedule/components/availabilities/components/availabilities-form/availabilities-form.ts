// my-schedule/components/availabilities/components/availabilities-form/availabilities-form.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { 
  AvailabilityCreateDTO, 
  AvailabilityPatchDTO, 
  AvailabilityDTO,
  AvailabilityRecurring
} from '../../../../../../models/availability';

@Component({
  selector: 'app-availabilities-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DialogModule, ButtonModule],
  templateUrl: './availabilities-form.html',
  styleUrls: ['./availabilities-form.scss'],
})
export class AvailabilitiesForm implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() editData: AvailabilityDTO | null = null;
  @Input() formData: AvailabilityCreateDTO | null = null;
  @Input() supplierId: number | null = null;  // ← Supplier ID desde el padre
  @Input() companyId: number | null = null;   // ← Company ID desde el padre
  @Input() loading = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<AvailabilityCreateDTO | AvailabilityPatchDTO>();
  @Output() cancel = new EventEmitter<void>();

  icons = { X };

  daysOfWeek = [
    { key: 'monday', label: 'LUN' },
    { key: 'tuesday', label: 'MAR' },
    { key: 'wednesday', label: 'MIE' },
    { key: 'thursday', label: 'JUE' },
    { key: 'friday', label: 'VIE' },
    { key: 'saturday', label: 'SAB' },
    { key: 'sunday', label: 'DOM' }
  ];

  recurrenceTypes = [
    { value: 'NONE', label: 'NONE' },
    { value: 'DAILY', label: 'DAILY' },
    { value: 'WEEKLY', label: 'WEEKLY' },
    { value: 'MONTHLY', label: 'MONTHLY' },
    { value: 'YEARLY', label: 'YEARLY' },
    { value: 'CUSTOM', label: 'CUSTOM' }
  ];

  statusOptions = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' }
  ];

  form: any = this.createEmptyForm();
  isEditMode = false;

  showEndDate = true;
  showDaysOfWeek = true;
  isRecurrenceDisabled = false;
  showStatus = false;

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.resetForm();
    }

    if (changes['editData'] && this.editData) {
      this.loadEditData();
    }

    if (changes['formData'] && this.formData) {
      this.form = { ...this.formData };
      this.updateUiByRecurrence();
    }

    // Cuando cambia supplierId, actualizar el formulario
    if (changes['supplierId'] && this.supplierId) {
      this.form.supplierId = this.supplierId;
    }

    // Cuando cambia companyId, actualizar el formulario
    if (changes['companyId'] && this.companyId) {
      this.form.companyId = this.companyId;
    }
  }

  private loadEditData(): void {
    if (!this.editData) return;
    
    this.isEditMode = true;
    this.showStatus = true;
    this.form = {
      companyId: this.editData.companyId,
      supplierId: this.editData.supplierId,
      startDate: this.editData.startDate,
      endDate: this.editData.endDate,
      startTime: this.editData.startTime,
      endTime: this.editData.endTime,
      monday: this.editData.monday,
      tuesday: this.editData.tuesday,
      wednesday: this.editData.wednesday,
      thursday: this.editData.thursday,
      friday: this.editData.friday,
      saturday: this.editData.saturday,
      sunday: this.editData.sunday,
      recurrenceType: this.editData.recurrenceType,
      slotDurationMinutes: this.editData.slotDurationMinutes,
      capacity: this.editData.capacity,
      notes: this.editData.notes,
      status: this.editData.status
    };
    
    this.isRecurrenceDisabled = true;
    this.updateUiByRecurrence();
  }

  resetForm(): void {
    this.showStatus = false;
    if (this.mode === 'edit' && this.editData) {
      this.loadEditData();
    } else if (this.formData) {
      this.form = { ...this.formData };
      this.isRecurrenceDisabled = false;
      this.updateUiByRecurrence();
    } else {
      this.form = this.createEmptyForm();
      this.isRecurrenceDisabled = false;
      this.updateUiByRecurrence();
    }
    this.isEditMode = this.mode === 'edit';
  }

  createEmptyForm(): AvailabilityCreateDTO {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    return {
      companyId: this.companyId || 0,
      supplierId: this.supplierId || 0,
      startDate: formattedDate,
      endDate: formattedDate,
      startTime: '09:00:00',
      endTime: '18:00:00',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      recurrenceType: 'WEEKLY' as AvailabilityRecurring,
      slotDurationMinutes: 60,
      capacity: 1,
      notes: ''
    };
  }

  updateUiByRecurrence(): void {
    const recurrence = this.form.recurrenceType;
    
    this.showEndDate = recurrence !== 'NONE';
    
    if (recurrence === 'NONE') {
      this.form.endDate = this.form.startDate;
    } else if (!this.form.endDate || this.form.endDate === this.form.startDate) {
      const today = new Date();
      const endDate = new Date(today);
      if (recurrence === 'MONTHLY' || recurrence === 'YEARLY') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setDate(endDate.getDate() + 30);
      }
      this.form.endDate = endDate.toISOString().split('T')[0];
    }
    
    this.showDaysOfWeek = recurrence === 'WEEKLY';
    
    if (this.showDaysOfWeek && !this.hasAnyDaySelected()) {
      this.setDefaultDays();
    }
    
    if (!this.showDaysOfWeek) {
      this.resetDays();
    }
    
    if (this.mode === 'edit') {
      this.isRecurrenceDisabled = true;
    }
  }

  hasAnyDaySelected(): boolean {
    return this.form.monday === true ||
           this.form.tuesday === true ||
           this.form.wednesday === true ||
           this.form.thursday === true ||
           this.form.friday === true ||
           this.form.saturday === true ||
           this.form.sunday === true;
  }

  setDefaultDays(): void {
    this.form.monday = true;
    this.form.tuesday = true;
    this.form.wednesday = true;
    this.form.thursday = true;
    this.form.friday = true;
    this.form.saturday = false;
    this.form.sunday = false;
  }

  resetDays(): void {
    this.form.monday = false;
    this.form.tuesday = false;
    this.form.wednesday = false;
    this.form.thursday = false;
    this.form.friday = false;
    this.form.saturday = false;
    this.form.sunday = false;
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get modalTitle(): string {
    if (this.mode === 'edit') return 'Editar disponibilidad';
    return 'Nueva disponibilidad';
  }

  onRecurrenceChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.form.recurrenceType = select.value as AvailabilityRecurring;
    this.updateUiByRecurrence();
  }

  onStartDateChange(): void {
    if (this.form.recurrenceType === 'NONE') {
      this.form.endDate = this.form.startDate;
    }
    
    if (this.form.endDate && this.form.endDate < this.form.startDate) {
      this.form.endDate = this.form.startDate;
    }
  }

  toggleDay(dayKey: string): void {
    if (this.showDaysOfWeek) {
      this.form[dayKey] = !this.form[dayKey];
    }
  }

  isDaySelected(dayKey: string): boolean {
    return !!this.form[dayKey];
  }

  getSelectedDaysCount(): number {
    return this.daysOfWeek.filter(day => this.isDaySelected(day.key)).length;
  }

  private validateForm(): boolean {
    if (!this.form.startDate) {
      alert('Por favor selecciona una fecha de inicio');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(this.form.startDate + 'T00:00:00');
    
    if (startDate < today) {
      alert('La fecha de inicio no puede ser en el pasado');
      return false;
    }

    if (this.showEndDate) {
      if (!this.form.endDate) {
        alert('Por favor selecciona una fecha de fin');
        return false;
      }
      if (this.form.endDate < this.form.startDate) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
        return false;
      }
    }

    if (!this.form.startTime || !this.form.endTime) {
      alert('Por favor selecciona un horario');
      return false;
    }

    if (this.form.startTime >= this.form.endTime) {
      alert('La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }

    if (this.showDaysOfWeek && this.form.recurrenceType === 'WEEKLY') {
      if (!this.hasAnyDaySelected()) {
        alert('Para recurrencia semanal (WEEKLY), debes seleccionar al menos un día de la semana');
        return false;
      }
    }

    if (!this.form.slotDurationMinutes || this.form.slotDurationMinutes <= 0) {
      alert('La duración del slot debe ser mayor a 0');
      return false;
    }

    if (!this.form.capacity || this.form.capacity <= 0) {
      alert('La capacidad debe ser mayor a 0');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    const monday = this.form.monday === true;
    const tuesday = this.form.tuesday === true;
    const wednesday = this.form.wednesday === true;
    const thursday = this.form.thursday === true;
    const friday = this.form.friday === true;
    const saturday = this.form.saturday === true;
    const sunday = this.form.sunday === true;

    if (this.isEditMode || this.mode === 'edit') {
      const patchData: AvailabilityPatchDTO = {};
      
      if (this.form.startDate) patchData.startDate = this.form.startDate;
      
      if (this.form.recurrenceType === 'NONE') {
        patchData.endDate = this.form.startDate;
      } else if (this.showEndDate && this.form.endDate) {
        patchData.endDate = this.form.endDate;
      }
      
      if (this.form.startTime) patchData.startTime = this.form.startTime;
      if (this.form.endTime) patchData.endTime = this.form.endTime;
      
      if (this.showDaysOfWeek) {
        patchData.monday = monday;
        patchData.tuesday = tuesday;
        patchData.wednesday = wednesday;
        patchData.thursday = thursday;
        patchData.friday = friday;
        patchData.saturday = saturday;
        patchData.sunday = sunday;
      } else {
        patchData.monday = false;
        patchData.tuesday = false;
        patchData.wednesday = false;
        patchData.thursday = false;
        patchData.friday = false;
        patchData.saturday = false;
        patchData.sunday = false;
      }
      
      if (this.form.recurrenceType) patchData.recurrenceType = this.form.recurrenceType;
      if (this.form.slotDurationMinutes) patchData.slotDurationMinutes = Number(this.form.slotDurationMinutes);
      if (this.form.capacity) patchData.capacity = Number(this.form.capacity);
      if (this.form.notes !== undefined) patchData.notes = this.form.notes;
      
      if (this.showStatus && this.form.status) {
        patchData.status = this.form.status;
      }

      this.save.emit(patchData);
    } else {
      const createData: AvailabilityCreateDTO = {
        companyId: Number(this.form.companyId),
        supplierId: Number(this.form.supplierId),
        startDate: this.form.startDate,
        endDate: this.showEndDate ? this.form.endDate : this.form.startDate,
        startTime: this.form.startTime,
        endTime: this.form.endTime,
        monday: monday,
        tuesday: tuesday,
        wednesday: wednesday,
        thursday: thursday,
        friday: friday,
        saturday: saturday,
        sunday: sunday,
        recurrenceType: this.form.recurrenceType,
        slotDurationMinutes: Number(this.form.slotDurationMinutes),
        capacity: Number(this.form.capacity),
        notes: this.form.notes || ''
      };

      this.save.emit(createData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onVisibleChange(value: boolean): void {
    if (!value) {
      this.cancel.emit();
    }
    this.visibleChange.emit(value);
  }
}