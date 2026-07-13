// my-schedule/components/bookings/bookings.component.ts
import { Component, OnInit, inject, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

// Servicios
import { BookingService } from '../../../../services/booking/booking';
import { PersonService } from '../../../../services/person-identity/person-identity';
import { ServicesService } from '../../../../services/service/service';
import { PaymentService } from '../../../../services/payment/payment';

// Modelos
import { BookingDTO, BookingCreateDTO, BookingPatchDTO, BookingStatus, BookingEvent } from '../../../../models/booking';
import { PersonIdentityDTO } from '../../../../models/person-identity';
import { ServiceDTO } from '../../../../models/service';
import { PaymentDTO, PaymentCreateDTO, PaymentPatchDTO } from '../../../../models/payment';

// Componentes
import { BookingsHeader } from './components/bookings-header/bookings-header';  // ← Importar BookingsHeader
import { BookingsList } from './components/bookings-list/bookings-list';
import { BookingsForm } from './components/bookings-form/bookings-form';
import { BookingDetailModal } from './components/booking-detail-modal/booking-detail-modal';
import { BookingsDeleteModal } from './components/bookings-delete-modal/bookings-delete-modal';
import { BookingsCalendar } from './components/bookings-calendar/bookings-calendar';

type ViewMode = 'list' | 'calendar';
type CalendarViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    BookingsHeader,  // ← Cambiar BookingsFilter por BookingsHeader
    BookingsList,
    BookingsForm,
    BookingDetailModal,
    BookingsDeleteModal,
    BookingsCalendar
  ],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.scss']
})
export class BookingsComponent implements OnInit, OnChanges {
  // ==================== INPUTS ====================
  @Input() supplierId: number | null = null;
  @Input() companyId: number | null = null;
  @Input() hasCreatePermission = false;
  @Input() hasReadPermission = false;
  @Input() hasUpdatePermission = false;
  @Input() hasDeletePermission = false;

  // ==================== INYECCIONES ====================
  private bookingService = inject(BookingService);
  private personService = inject(PersonService);
  private servicesService = inject(ServicesService);
  private paymentService = inject(PaymentService);
  private cdr = inject(ChangeDetectorRef);

  // ==================== ESTADO ====================
  loading = false;
  loadingPayment = false;
  error: string | null = null;

  // ==================== DATOS ====================
  allCustomers: PersonIdentityDTO[] = [];
  allServices: ServiceDTO[] = [];
  bookings: BookingDTO[] = [];
  filteredBookings: BookingDTO[] = [];

  // ==================== CALENDARIO ====================
  events: BookingEvent[] = [];
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  calendarViewMode: CalendarViewMode = 'week';
  viewMode: ViewMode = 'list';

  // ==================== MODALES ====================
  showCreateModal = false;
  showDetailModal = false;
  showDeleteModal = false;
  selectedBooking: BookingDTO | null = null;
  selectedPayment: PaymentDTO | null = null;
  bookingToDelete: BookingDTO | null = null;
  createFormData: BookingCreateDTO | null = null;

  // ==================== GETTERS ====================
  get totalBookings(): number { return this.filteredBookings.length; }
  get canCreate(): boolean { return this.hasCreatePermission && !!this.supplierId; }
  get canRead(): boolean { return this.hasReadPermission && !!this.supplierId; }

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.loadCustomers();
    this.loadServices();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplierId'] && this.supplierId) {
      this.loadBookings(this.supplierId);
    }
  }

  // ==================== CARGA DE DATOS ====================
  private loadCustomers(): void {
    this.personService.getAll().subscribe({
      next: data => {
        this.allCustomers = (data ?? []).filter(x => x.customer !== null);
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading customers:', err)
    });
  }

  private loadServices(): void {
    this.servicesService.getAll().subscribe({
      next: data => {
        this.allServices = data ?? [];
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading services:', err)
    });
  }

  private loadBookings(supplierId: number): void {
    if (!this.canRead) {
      this.bookings = [];
      this.filteredBookings = [];
      this.events = [];
      return;
    }

    this.loading = true;
    this.error = null;

    this.bookingService.getBySupplier(supplierId).subscribe({
      next: data => {
        this.bookings = data;
        this.filteredBookings = data;
        this.events = this.convertToEvents(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading bookings:', err);
        this.error = 'Failed to load bookings';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== CONVERSIÓN A EVENTOS ====================
  private convertToEvents(bookings: BookingDTO[]): BookingEvent[] {
    return bookings.map(b => ({
      id: b.id,
      title: b.name || `Reserva #${b.id}`,
      start: new Date(b.startTime),
      end: new Date(b.endTime),
      booking: b,
      customerName: this.getCustomerName(b.customerId),
      serviceName: this.getServiceName(b.serviceId)
    }));
  }

  private getCustomerName(customerId: number): string {
    const customer = this.allCustomers.find(c => c.customer?.id === customerId);
    return customer ? `${customer.person.firstName} ${customer.person.lastName}` : `Cliente #${customerId}`;
  }

  private getServiceName(serviceId: number): string {
    const service = this.allServices.find(s => s.id === serviceId);
    return service?.name || `Servicio #${serviceId}`;
  }

  // ==================== NAVEGACIÓN DEL CALENDARIO ====================
  goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
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
    this.cdr.detectChanges();
  }

  setCalendarView(mode: CalendarViewMode): void {
    this.calendarViewMode = mode;
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

  onEventClick(event: BookingEvent): void {
    this.openDetailModal(event.booking);
  }

  // ==================== MODAL - CREACIÓN ====================
  onAddClick(): void {
    if (!this.canCreate) return;

    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000);

    this.createFormData = {
      companyId: this.companyId || 0,
      serviceId: 0,
      customerId: 0,
      startTime: this.formatDateTimeLocal(now),
      endTime: this.formatDateTimeLocal(end),
      type: 'APPOINTMENT',
      name: '',
      description: ''
    };

    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createFormData = null;
  }

  onCreateBooking(data: BookingCreateDTO): void {
    if (!this.supplierId) return;

    if (!data.companyId || data.companyId === 0) {
      data.companyId = this.companyId || 0;
    }

    this.loading = true;
    this.bookingService.create(data).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loading = false;
        if (this.supplierId) {
          this.loadBookings(this.supplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating booking:', err);
        alert('❌ ' + (err.error?.message || 'Error al crear la reserva'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== MODAL - DETALLE ====================
  openDetailModal(booking: BookingDTO): void {
    if (!this.hasReadPermission) return;

    this.selectedBooking = booking;
    this.selectedPayment = null;
    this.showDetailModal = true;
    this.loadingPayment = true;

    this.paymentService.getByBookingId(booking.id).subscribe({
      next: (payment) => {
        this.selectedPayment = payment;
        this.loadingPayment = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedPayment = null;
        this.loadingPayment = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBooking = null;
    this.selectedPayment = null;
  }

  onUpdateBookingStatus(event: { id: number; status: BookingStatus }): void {
    if (!this.hasUpdatePermission) return;

    this.loading = true;
    this.bookingService.patch(event.id, { status: event.status }).subscribe({
      next: () => {
        this.loading = false;
        this.closeDetailModal();
        if (this.supplierId) {
          this.loadBookings(this.supplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating booking status:', err);
        alert('❌ ' + (err.error?.message || 'Error al actualizar el estado'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onUpdateBookingFull(event: { id: number; data: BookingPatchDTO }): void {
    if (!this.hasUpdatePermission) return;

    this.loading = true;
    this.bookingService.patch(event.id, event.data).subscribe({
      next: () => {
        this.loading = false;
        if (this.supplierId) {
          this.loadBookings(this.supplierId);
        }
        this.bookingService.getById(event.id).subscribe(updated => {
          this.selectedBooking = updated;
          this.cdr.detectChanges();
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating booking:', err);
        alert('❌ ' + (err.error?.message || 'Error al actualizar la reserva'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDeleteBookingFromDetail(id: number): void {
    if (!this.hasDeletePermission) return;

    this.loading = true;
    this.bookingService.delete(id).subscribe({
      next: () => {
        this.loading = false;
        this.closeDetailModal();
        if (this.supplierId) {
          this.loadBookings(this.supplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting booking:', err);
        alert('❌ ' + (err.error?.message || 'Error al eliminar la reserva'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== MODAL - ELIMINACIÓN ====================
  openDeleteModal(booking: BookingDTO): void {
    if (!this.hasDeletePermission) return;
    this.bookingToDelete = booking;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.bookingToDelete = null;
  }

  confirmDeleteBooking(): void {
    if (!this.bookingToDelete) return;

    this.loading = true;
    this.bookingService.delete(this.bookingToDelete.id).subscribe({
      next: () => {
        this.loading = false;
        this.showDeleteModal = false;
        this.bookingToDelete = null;
        if (this.supplierId) {
          this.loadBookings(this.supplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting booking:', err);
        alert('❌ ' + (err.error?.message || 'Error al eliminar la reserva'));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== PAGOS ====================
  onSavePayment(data: PaymentCreateDTO): void {
    this.loadingPayment = true;
    this.paymentService.create(data).subscribe({
      next: (payment) => {
        this.selectedPayment = payment;
        this.loadingPayment = false;
        if (this.supplierId) {
          this.loadBookings(this.supplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating payment:', err);
        alert('❌ ' + (err.error?.message || 'Error al crear el pago'));
        this.loadingPayment = false;
        this.cdr.detectChanges();
      }
    });
  }

  onUpdatePayment(event: { id: number; data: PaymentPatchDTO }): void {
    this.loadingPayment = true;
    this.paymentService.patch(event.id, event.data).subscribe({
      next: (payment) => {
        this.selectedPayment = payment;
        this.loadingPayment = false;
        if (this.supplierId) {
          this.loadBookings(this.supplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating payment:', err);
        alert('❌ ' + (err.error?.message || 'Error al actualizar el pago'));
        this.loadingPayment = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDeletePayment(id: number): void {
    this.loadingPayment = true;
    this.paymentService.delete(id).subscribe({
      next: () => {
        this.selectedPayment = null;
        this.loadingPayment = false;
        if (this.supplierId) {
          this.loadBookings(this.supplierId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting payment:', err);
        alert('❌ ' + (err.error?.message || 'Error al eliminar el pago'));
        this.loadingPayment = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== GETTERS FILTRADOS ====================
  get filteredCustomers(): PersonIdentityDTO[] {
    if (!this.companyId) return [];
    return this.allCustomers.filter(c => c.person.companyId === this.companyId);
  }

  get filteredServices(): ServiceDTO[] {
    if (!this.supplierId) return [];
    return this.allServices.filter(s => s.supplierId === this.supplierId);
  }

  // ==================== HELPERS ====================
  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // ==================== RECARGA EXTERNA ====================
  reload(): void {
    if (this.supplierId) {
      this.loadBookings(this.supplierId);
    }
  }
}