import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Plus } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { 
  BookingCreateDTO, 
  BookingType
} from '../../../../../../models/booking';
import { PersonIdentityDTO } from '../../../../../../models/person-identity';
import { ServiceDTO } from '../../../../../../models/service';

@Component({
  selector: 'app-bookings-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DialogModule, ButtonModule],
  templateUrl: './bookings-form.html',
  styleUrls: ['./bookings-form.scss'],
})
export class BookingsForm implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() createData: BookingCreateDTO | null = null;
  @Input() services: ServiceDTO[] = [];
  @Input() customers: PersonIdentityDTO[] = [];
  @Input() loading = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<BookingCreateDTO>();
  @Output() cancel = new EventEmitter<void>();

  icons = { X, Plus };

  typeOptions = [
    { value: 'APPOINTMENT', label: 'Cita' },
    { value: 'RESERVATION', label: 'Reserva' }
  ];

  // ==================== FORMULARIO ====================
  form: {
    companyId: number;
    customerId: number;
    serviceId: number;
    date: string;          // YYYY-MM-DD
    startTime: string;     // HH:mm
    durationMinutes: number;
    type: BookingType;
    name: string;
    description: string;
  } = this.createEmptyForm();

  // ==================== INICIALIZACIÓN ====================

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.resetForm();
    }
    if (changes['createData'] && this.createData) {
      this.loadFromCreateData();
    }
  }

  private loadFromCreateData(): void {
    if (!this.createData) return;
    const start = new Date(this.createData.startTime);
    const end = new Date(this.createData.endTime);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    this.form = {
      companyId: this.createData.companyId || 0,
      customerId: this.createData.customerId || 0,
      serviceId: this.createData.serviceId || 0,
      date: this.formatDate(start),
      startTime: this.formatTime(start),
      durationMinutes: duration || 60,
      type: this.createData.type || 'APPOINTMENT',
      name: this.createData.name || '',
      description: this.createData.description || ''
    };

    if (this.form.serviceId) {
      this.updateDurationFromService(this.form.serviceId);
    }
  }

  resetForm(): void {
    if (this.createData) {
      this.loadFromCreateData();
    } else {
      this.form = this.createEmptyForm();
    }
  }

  createEmptyForm() {
    const now = new Date();
    return {
      companyId: 0,
      customerId: 0,
      serviceId: 0,
      date: this.formatDate(now),
      startTime: this.formatTime(now),
      durationMinutes: 60,
      type: 'APPOINTMENT' as BookingType,
      name: '',
      description: ''
    };
  }

  // ==================== FORMATOS ====================

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  // ==================== GETTERS ====================

  get modalTitle(): string {
    return 'Agendar';
  }

  get minDate(): string {
    return this.formatDate(new Date());
  }

  get minTime(): string {
    const now = new Date();
    const today = this.formatDate(now);
    if (this.form.date === today) {
      return this.formatTime(now);
    }
    return '00:00';
  }

  // 🔥 Getter para mostrar el fin estimado en el HTML
  get endTimeDisplay(): string {
    if (!this.form.date || !this.form.startTime || !this.form.durationMinutes) {
      return '--:--';
    }
    const end = this.buildEndDateTime();
    return this.formatTime(end);
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  getPersonName(personIdentity: PersonIdentityDTO): string {
    return `${personIdentity.person.firstName} ${personIdentity.person.lastName}`;
  }

  // ==================== EVENTOS ====================

  onServiceChange(serviceId: number): void {
    this.form.serviceId = serviceId;
    this.updateDurationFromService(serviceId);
  }

  onCustomerChange(customerId: number): void {
    this.form.customerId = customerId;
  }

  onDateChange(): void {
    // No es necesario recalcular nada, el getter endTimeDisplay se actualiza solo
  }

  onStartTimeChange(): void {
    // No es necesario recalcular nada, el getter endTimeDisplay se actualiza solo
  }

  // ==================== LÓGICA DE DURACIÓN ====================

  private updateDurationFromService(serviceId: number): void {
    const service = this.services.find(s => s.id === serviceId);
    if (service && service.duration) {
      this.form.durationMinutes = service.duration;
    }
  }

  // ==================== CONSTRUIR DATETIME ====================

  private buildStartDateTime(): Date {
    const [year, month, day] = this.form.date.split('-').map(Number);
    const [hours, minutes] = this.form.startTime.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  // 🔥 Hacer público para poder usar en el template (aunque usamos endTimeDisplay)
  public buildEndDateTime(): Date {
    const start = this.buildStartDateTime();
    return new Date(start.getTime() + this.form.durationMinutes * 60000);
  }

  // ==================== VALIDACIÓN ====================

  private validateForm(): boolean {
    if (!this.form.serviceId || this.form.serviceId === 0) {
      alert('Por favor selecciona un servicio');
      return false;
    }

    if (!this.form.customerId || this.form.customerId === 0) {
      alert('Por favor selecciona un cliente');
      return false;
    }

    if (!this.form.date) {
      alert('Por favor selecciona una fecha');
      return false;
    }

    if (!this.form.startTime) {
      alert('Por favor selecciona una hora de inicio');
      return false;
    }

    if (this.form.durationMinutes <= 0) {
      alert('La duración debe ser mayor a 0 minutos');
      return false;
    }

    const start = this.buildStartDateTime();
    const now = new Date();
    if (start < now) {
      alert('La fecha y hora de inicio no puede ser en el pasado');
      return false;
    }

    return true;
  }

  // ==================== ENVIAR ====================

  onSubmit(): void {
    if (!this.validateForm()) return;

    const start = this.buildStartDateTime();
    const end = this.buildEndDateTime();

    const createData: BookingCreateDTO = {
      companyId: Number(this.form.companyId || 0),
      serviceId: Number(this.form.serviceId),
      customerId: Number(this.form.customerId),
      startTime: this.formatDateTimeLocal(start),
      endTime: this.formatDateTimeLocal(end),
      type: this.form.type,
      name: this.form.name || '',
      description: this.form.description || ''
    };

    console.log('📤 Enviando CREATE:', createData);
    this.save.emit(createData);
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

  trackByService(index: number, service: ServiceDTO): number {
    return service.id;
  }

  trackByCustomer(index: number, customer: PersonIdentityDTO): number {
    return customer.person.id;
  }
}