import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Plus, Pen, Trash2, CircleCheckBig, Pencil, Save } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BookingDTO, BookingStatus, BookingType, BookingPatchDTO } from '../../../../models/booking';
import { PaymentDTO, PaymentCreateDTO, PaymentPatchDTO, PaymentMethod, PaymentStatus } from '../../../../models/payment';
import { PersonIdentityDTO } from '../../../../models/person-identity';
import { ServiceDTO } from '../../../../models/service';
import { 
  getPaymentStatusColor, 
  getPaymentStatusLabel, 
  getPaymentMethodLabel,
  formatPaymentAmount,
  isPaymentEditable
} from '../../../../models/payment';

interface PaymentForm {
  companyId?: number;
  bookingId?: number;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
}

@Component({
  selector: 'app-booking-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DialogModule, ButtonModule],
  templateUrl: './booking-detail-modal.html',
  styleUrls: ['./booking-detail-modal.scss'],
})
export class BookingDetailModal implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() booking: BookingDTO | null = null;
  @Input() payment: PaymentDTO | null = null;
  @Input() customers: PersonIdentityDTO[] = [];
  @Input() services: ServiceDTO[] = [];
  @Input() loading = false;
  @Input() loadingPayment = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();
  @Output() updateBookingStatus = new EventEmitter<{ id: number; status: BookingStatus }>();
  @Output() updateBookingFull = new EventEmitter<{ id: number; data: BookingPatchDTO }>();
  @Output() deleteBooking = new EventEmitter<number>();
  @Output() savePayment = new EventEmitter<PaymentCreateDTO>();
  @Output() updatePayment = new EventEmitter<{ id: number; data: PaymentPatchDTO }>();
  @Output() deletePayment = new EventEmitter<number>();

  icons = { X, Plus, Pen, Trash2, CircleCheckBig, Pencil, Save };

  // ==================== ESTADO DE EDICIÓN ====================
  isEditingBooking = false;

  // Formulario de edición
  editForm: {
    customerId: number;
    serviceId: number;
    date: string;
    startTime: string;
    durationMinutes: number;
    type: BookingType;
    name: string;
    description: string;
  } = {
    customerId: 0,
    serviceId: 0,
    date: '',
    startTime: '',
    durationMinutes: 60,
    type: 'APPOINTMENT',
    name: '',
    description: ''
  };

  // ==================== ESTADO DE PAGO ====================
  showPaymentForm = false;
  isEditingPayment = false;
  paymentForm: PaymentForm = this.createEmptyPaymentForm();

  // ==================== OPCIONES ====================
  paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'CREDIT_CARD', label: 'Tarjeta Crédito' },
    { value: 'DEBIT_CARD', label: 'Tarjeta Débito' },
    { value: 'BANK_TRANSFER', label: 'Transferencia' },
    { value: 'YAPE', label: 'Yape' },
    { value: 'PLIN', label: 'Plin' },
    { value: 'DIGITAL_WALLET', label: 'Billetera Digital' },
    { value: 'OTHER', label: 'Otro' }
  ];

  paymentStatuses: { value: PaymentStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'PAID', label: 'Pagado' },
    { value: 'PARTIALLY_PAID', label: 'Parcial' },
    { value: 'FAILED', label: 'Fallido' },
    { value: 'REFUNDED', label: 'Reembolsado' },
    { value: 'CANCELLED', label: 'Cancelado' }
  ];

  typeOptions: { value: BookingType; label: string }[] = [
    { value: 'APPOINTMENT', label: 'Cita' },
    { value: 'RESERVATION', label: 'Reserva' }
  ];

  // ==================== LIFECYCLE ====================

  ngOnInit(): void {
    this.resetPaymentForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && !this.visible) {
      this.resetPaymentForm();
      this.showPaymentForm = false;
      this.isEditingBooking = false;
    }
    if (changes['payment'] && this.payment) {
      this.showPaymentForm = false;
      this.isEditingPayment = false;
    }
    if (changes['booking'] && this.booking) {
      this.isEditingBooking = false;
      this.initEditForm();
    }
  }

  // ==================== INICIALIZAR FORMULARIO DE EDICIÓN ====================

  private initEditForm(): void {
    if (!this.booking) return;

    const start = new Date(this.booking.startTime);
    const end = new Date(this.booking.endTime);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    const service = this.services.find(s => s.id === this.booking?.serviceId);
    const serviceDuration = service?.duration || duration;

    this.editForm = {
      customerId: this.booking.customerId,
      serviceId: this.booking.serviceId,
      date: this.formatDate(start),
      startTime: this.formatTime(start),
      durationMinutes: serviceDuration,
      type: this.booking.type,
      name: this.booking.name || '',
      description: this.booking.description || ''
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
    return `Detalle de cita #${this.booking?.id || ''}`;
  }

  get minDate(): string {
    return this.formatDate(new Date());
  }

  get minTime(): string {
    const now = new Date();
    const today = this.formatDate(now);
    if (this.editForm.date === today) {
      return this.formatTime(now);
    }
    return '00:00';
  }

  get endTimeDisplay(): string {
    if (!this.editForm.date || !this.editForm.startTime || !this.editForm.durationMinutes) {
      return '--:--';
    }
    const end = this.buildEndDateTime();
    return this.formatTime(end);
  }

  get customerName(): string {
    const booking = this.booking;
    if (!booking) return '—';
    const customer = this.customers.find(c => c.customer?.id === booking.customerId);
    return customer ? `${customer.person.firstName} ${customer.person.lastName}` : `Cliente #${booking.customerId}`;
  }

  get customerEmail(): string {
    const booking = this.booking;
    if (!booking) return '';
    const customer = this.customers.find(c => c.customer?.id === booking.customerId);
    return customer?.person.email || '';
  }

  get customerPhone(): string {
    const booking = this.booking;
    if (!booking) return '';
    const customer = this.customers.find(c => c.customer?.id === booking.customerId);
    return customer?.person.phone || '';
  }

  get serviceName(): string {
    const booking = this.booking;
    if (!booking) return '—';
    const service = this.services.find(s => s.id === booking.serviceId);
    return service?.name || `Servicio #${booking.serviceId}`;
  }

  get serviceDuration(): string {
    const booking = this.booking;
    if (!booking) return '';
    const service = this.services.find(s => s.id === booking.serviceId);
    return service?.duration ? `${service.duration} min` : '';
  }

  get servicePrice(): string {
    const booking = this.booking;
    if (!booking) return '';
    const service = this.services.find(s => s.id === booking.serviceId);
    return service?.price ? `S/. ${service.price.toFixed(2)}` : '';
  }

  get statusLabel(): string {
    const map: Record<string, string> = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'INACTIVE': 'Inactiva',
      'DELETED': 'Eliminada'
    };
    return this.booking ? map[this.booking.status] || this.booking.status : '';
  }

  get statusColor(): string {
    const map: Record<string, string> = {
      'PENDING': 'bg-yellow-500/10 text-yellow-400',
      'CONFIRMED': 'bg-emerald-500/10 text-emerald-400',
      'COMPLETED': 'bg-blue-500/10 text-blue-400',
      'CANCELLED': 'bg-red-500/10 text-red-400',
      'INACTIVE': 'bg-gray-500/10 text-gray-400',
      'DELETED': 'bg-gray-500/10 text-gray-400'
    };
    return this.booking ? map[this.booking.status] || 'bg-gray-500/10 text-gray-400' : '';
  }

  get hasPayment(): boolean {
    return !!this.payment && this.payment.status !== 'DELETED';
  }

  get isBookingCompleted(): boolean {
    return this.booking?.status === 'COMPLETED';
  }

  get isBookingCancelled(): boolean {
    return this.booking?.status === 'CANCELLED' || this.booking?.status === 'DELETED';
  }

  // ---------- NUEVOS GETTERS PARA BOTONES RÁPIDOS ----------
  get canConfirmBooking(): boolean {
    return this.booking?.status === 'PENDING';
  }

  get canReopenBooking(): boolean {
    return this.booking?.status === 'CANCELLED';
  }

  get canCompleteBooking(): boolean {
    return this.booking?.status === 'CONFIRMED' && this.hasPayment && this.payment?.status === 'PAID';
  }

  get canCancelBooking(): boolean {
    return !this.isBookingCompleted && !this.isBookingCancelled;
  }

  get canDeleteBooking(): boolean {
    return !this.isBookingCancelled;
  }

  get canEditBooking(): boolean {
    return !this.isBookingCompleted && !this.isBookingCancelled;
  }

  get canEditPayment(): boolean {
    return this.hasPayment && !this.isBookingCompleted && !this.isBookingCancelled && isPaymentEditable(this.payment!);
  }

  get canAddPayment(): boolean {
    return !this.hasPayment && !this.isBookingCompleted && !this.isBookingCancelled;
  }

  // ==================== FORMATOS PARA MOSTRAR ====================

  formatDateDisplay(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTimeDisplay(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    return getPaymentMethodLabel(method);
  }

  getPaymentStatusLabel(status: PaymentStatus): string {
    return getPaymentStatusLabel(status);
  }

  getPaymentStatusColor(status: PaymentStatus): string {
    return getPaymentStatusColor(status);
  }

  formatAmount(amount: number): string {
    return formatPaymentAmount(amount);
  }

  // ==================== FORMULARIO DE PAGO ====================

  createEmptyPaymentForm(): PaymentForm {
    return {
      companyId: this.booking?.companyId || 0,
      bookingId: this.booking?.id || 0,
      amount: 0,
      method: 'CASH',
      status: 'PENDING'
    };
  }

  resetPaymentForm(): void {
    this.paymentForm = this.createEmptyPaymentForm();
    this.isEditingPayment = false;
  }

  openPaymentForm(): void {
    this.showPaymentForm = true;
    this.isEditingPayment = false;
    this.paymentForm = {
      companyId: this.booking?.companyId || 0,
      bookingId: this.booking?.id || 0,
      amount: 0,
      method: 'CASH'
    };
  }

  openEditPaymentForm(): void {
    if (!this.payment) return;
    this.showPaymentForm = true;
    this.isEditingPayment = true;
    this.paymentForm = {
      amount: this.payment.amount,
      status: this.payment.status,
      method: this.payment.method
    };
  }

  closePaymentForm(): void {
    this.showPaymentForm = false;
    this.isEditingPayment = false;
    this.resetPaymentForm();
  }

  onSavePayment(): void {
    if (this.isEditingPayment && this.payment) {
      const patchData: PaymentPatchDTO = {
        amount: this.paymentForm.amount,
        status: this.paymentForm.status!,
        method: this.paymentForm.method
      };
      this.updatePayment.emit({ id: this.payment.id, data: patchData });
    } else {
      const createData: PaymentCreateDTO = {
        companyId: this.booking?.companyId || 0,
        bookingId: this.booking?.id || 0,
        amount: this.paymentForm.amount || 0,
        method: this.paymentForm.method
      };
      this.savePayment.emit(createData);
    }
    this.closePaymentForm();
  }

  // ==================== CONSTRUIR FECHAS ====================

  private buildStartDateTime(): Date {
    const [year, month, day] = this.editForm.date.split('-').map(Number);
    const [hours, minutes] = this.editForm.startTime.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  private buildEndDateTime(): Date {
    const start = this.buildStartDateTime();
    return new Date(start.getTime() + this.editForm.durationMinutes * 60000);
  }

  // ==================== EVENTOS DEL FORMULARIO DE EDICIÓN ====================

  onServiceChange(serviceId: number): void {
    this.editForm.serviceId = serviceId;
    const service = this.services.find(s => s.id === serviceId);
    if (service && service.duration) {
      this.editForm.durationMinutes = service.duration;
    }
  }

  onCustomerChange(customerId: number): void {
    this.editForm.customerId = customerId;
  }

  onDateChange(): void { /* getter actualiza automáticamente */ }
  onStartTimeChange(): void { /* getter actualiza automáticamente */ }

  // ==================== TOGGLE EDICIÓN ====================

  toggleEditBooking(): void {
    if (this.isEditingBooking) {
      this.isEditingBooking = false;
      this.initEditForm();
    } else {
      this.isEditingBooking = true;
    }
  }

  // ==================== GUARDAR EDICIÓN ====================

  onSaveBookingEdit(): void {
    if (!this.booking) return;

    const start = this.buildStartDateTime();
    const end = this.buildEndDateTime();

    const patchData: BookingPatchDTO = {
      serviceId: this.editForm.serviceId,
      customerId: this.editForm.customerId,
      startTime: this.formatDateTimeLocal(start),
      endTime: this.formatDateTimeLocal(end),
      type: this.editForm.type,
      name: this.editForm.name || '',
      description: this.editForm.description || ''
    };

    this.updateBookingFull.emit({
      id: this.booking.id,
      data: patchData
    });
  }

  // ==================== ACCIONES RÁPIDAS DE ESTADO ====================

  onConfirmBooking(): void {
    if (!this.booking) return;
    if (confirm('¿Confirmar esta cita?')) {
      this.updateBookingStatus.emit({ id: this.booking.id, status: 'CONFIRMED' });
    }
  }

  onReopenBooking(): void {
    if (!this.booking) return;
    if (confirm('¿Reabrir esta cita (volver a Pendiente)?')) {
      this.updateBookingStatus.emit({ id: this.booking.id, status: 'PENDING' });
    }
  }

  onCompleteBooking(): void {
    if (!this.booking) return;
    if (confirm('¿Marcar esta cita como completada?')) {
      this.updateBookingStatus.emit({ id: this.booking.id, status: 'COMPLETED' });
    }
  }

  onCancelBooking(): void {
    if (!this.booking) return;
    if (confirm('¿Cancelar esta cita?')) {
      this.updateBookingStatus.emit({ id: this.booking.id, status: 'CANCELLED' });
    }
  }

  onDeleteBooking(): void {
    if (!this.booking) return;
    if (confirm('¿Eliminar esta cita? Esta acción no se puede deshacer.')) {
      this.deleteBooking.emit(this.booking.id);
    }
  }

  onDeletePayment(): void {
    if (!this.payment) return;
    if (confirm('¿Eliminar este pago?')) {
      this.deletePayment.emit(this.payment.id);
    }
  }

  // ==================== CERRAR MODAL ====================

  onClose(): void {
    this.close.emit();
    this.visibleChange.emit(false);
  }

  onVisibleChange(value: boolean): void {
    if (!value) {
      this.onClose();
    }
    this.visibleChange.emit(value);
  }

  // ==================== HELPERS PARA SELECTS ====================

  getPersonName(personIdentity: PersonIdentityDTO): string {
    return `${personIdentity.person.firstName} ${personIdentity.person.lastName}`;
  }

  getServiceNameForSelect(service: ServiceDTO): string {
    return service.name;
  }

  getServiceDurationForSelect(service: ServiceDTO): number {
    return service.duration || 0;
  }
}