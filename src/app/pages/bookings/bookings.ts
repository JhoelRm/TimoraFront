import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

// Servicios
import { BookingService } from '../../services/booking/booking';
import { PersonService } from '../../services/person-identity/person-identity';
import { AuthService } from '../../services/auth/auth';
import { CompaniesService } from '../../services/companies/companies';
import { ServicesService } from '../../services/service/service';
import { PaymentService } from '../../services/payment/payment';

// Modelos
import { BookingDTO, BookingCreateDTO, BookingPatchDTO, BookingStatus, BookingEvent } from '../../models/booking';
import { PersonIdentityDTO } from '../../models/person-identity';
import { CurrentUser } from '../../models/currentUser';
import { CompanyDTO } from '../../models/company';
import { ServiceDTO } from '../../models/service';
import { PaymentDTO, PaymentCreateDTO, PaymentPatchDTO } from '../../models/payment';

// Componentes
import { BookingsFilter } from './components/bookings-filter/bookings-filter';
import { BookingsList } from './components/bookings-list/bookings-list';
import { BookingsForm } from './components/bookings-form/bookings-form';
import { BookingDetailModal } from './components/booking-detail-modal/booking-detail-modal';
import { BookingsDeleteModal } from './components/bookings-delete-modal/bookings-delete-modal';
import { BookingsCalendar } from './components/bookings-calendar/bookings-calendar'; // ✅ Importar calendario

type ViewMode = 'list' | 'calendar';
type CalendarViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    BookingsFilter,
    BookingsList,
    BookingsForm,
    BookingDetailModal,
    BookingsDeleteModal,
    BookingsCalendar // ✅ Importar
  ],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.scss']
})
export class BookingsComponent implements OnInit {
  // ==================== INYECCIONES ====================
  private bookingService = inject(BookingService);
  private personService = inject(PersonService);
  private authService = inject(AuthService);
  private companiesService = inject(CompaniesService);
  private servicesService = inject(ServicesService);
  private paymentService = inject(PaymentService);
  private cdr = inject(ChangeDetectorRef);

  // ==================== ESTADO ====================
  currentUser: CurrentUser | null = null;
  loading = false;
  loadingPayment = false;
  ready = false;
  error: string | null = null;

  // ==================== DATOS ====================
  allCompanies: CompanyDTO[] = [];
  allSuppliers: PersonIdentityDTO[] = [];
  allCustomers: PersonIdentityDTO[] = [];
  allServices: ServiceDTO[] = [];
  filteredSuppliers: PersonIdentityDTO[] = [];
  bookings: BookingDTO[] = [];
  filteredBookings: BookingDTO[] = [];

  // ==================== CALENDARIO ====================
  events: BookingEvent[] = [];
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  calendarViewMode: CalendarViewMode = 'week';

  // ==================== FILTROS SELECCIONADOS ====================
  selectedCompanyId: number | null = null;
  selectedSupplierId: number | null = null;
  viewMode: ViewMode = 'list';

  // ==================== MODALES ====================
  showCreateModal = false;
  showDetailModal = false;
  showDeleteModal = false;

  // Datos para modales
  selectedBooking: BookingDTO | null = null;
  selectedPayment: PaymentDTO | null = null;
  bookingToDelete: BookingDTO | null = null;
  createFormData: BookingCreateDTO | null = null;

  // ==================== GETTERS DE CONTEXTO ====================
  get isOwner(): boolean { return this.currentUser?.role === 'OWNER'; }
  get isAdmin(): boolean { return this.currentUser?.role === 'ADMIN'; }
  get isUser(): boolean { return this.currentUser?.role === 'USER'; }
  
  // ==================== GETTERS DE UI ====================
  get canSelectCompany(): boolean { return this.isOwner; }
  get canSelectSupplier(): boolean { return this.isOwner || this.isAdmin; }
  get isReadOnly(): boolean { return false; }
  get totalBookings(): number { return this.filteredBookings.length; }

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    console.log('👤 Usuario actual:', {
      role: this.currentUser?.role,
      companyId: this.currentUser?.companyId,
      personId: this.currentUser?.personId
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
      console.log('🏢 ADMIN - Compañía fijada:', this.selectedCompanyId);
    }
    
    if (this.isUser && user.personId) {
      console.log('👤 USER - Persona ID:', user.personId);
    }
  }

  // ==================== CARGA DE DATOS ====================
  private loadData(): void {
    if (this.isOwner) {
      this.loadCompanies();
    }
    this.loadSuppliers();
    this.loadCustomers();
    this.loadServices();
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
    console.log('🔄 Cargando suppliers...');
    
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
        console.error('❌ Error loading suppliers:', err);
        this.error = 'Failed to load suppliers';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadCustomers(): void {
    this.personService.getAll().subscribe({
      next: data => {
        this.allCustomers = (data ?? []).filter(x => x.customer !== null);
        console.log('👤 Clientes cargados:', this.allCustomers.length);
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading customers:', err)
    });
  }

  private loadServices(): void {
    this.servicesService.getAll().subscribe({
      next: data => {
        this.allServices = data ?? [];
        console.log('📦 Servicios cargados:', this.allServices.length);
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading services:', err)
    });
  }

  // ==================== FILTROS ====================
  private applyFiltersAndLoad(): void {
    const user = this.currentUser;
    let suppliers = [...this.allSuppliers];
    
    console.log('🔍 Aplicando filtros...');
    console.log('📌 Antes del filtro:', suppliers.length);
    
    if (this.isOwner && this.selectedCompanyId) {
      suppliers = suppliers.filter(s => s.person.companyId === this.selectedCompanyId);
      console.log('🏢 OWNER - Filtrado por compañía:', this.selectedCompanyId);
      console.log('📌 Después de compañía:', suppliers.length);
    }
    
    if (this.isAdmin && user?.companyId) {
      suppliers = suppliers.filter(s => s.person.companyId === user.companyId);
      console.log('🏢 ADMIN - Filtrado por compañía:', user.companyId);
      console.log('📌 Después de compañía:', suppliers.length);
    }
    
    if (this.isUser && user?.personId) {
      suppliers = suppliers.filter(s => s.person.id === user.personId);
      console.log('👤 USER - Filtrado por persona:', user.personId);
      console.log('📌 Después de persona:', suppliers.length);
      
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
    console.log('📊 Suppliers filtrados:', this.filteredSuppliers.length);
    console.log('✅ Supplier seleccionado final:', this.selectedSupplierId);
    
    if (this.selectedSupplierId) {
      this.loadBookings(this.selectedSupplierId);
    } else {
      this.filteredBookings = [];
      this.bookings = [];
      this.events = [];
      this.loading = false;
      console.log('ℹ️ No hay supplier seleccionado');
    }
    
    this.cdr.detectChanges();
  }

  // ==================== CARGAR BOOKINGS ====================
  private loadBookings(supplierId: number): void {
    this.loading = true;
    console.log('🔄 Cargando bookings para supplier:', supplierId);
    
    this.bookingService.getBySupplier(supplierId).subscribe({
      next: data => {
        this.bookings = data;
        this.filteredBookings = data;
        this.events = this.convertToEvents(data); // ✅ Convertir a eventos
        console.log('📋 Bookings cargados:', this.bookings.length);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('❌ Error loading bookings:', err);
        this.error = 'Failed to load bookings';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== CONVERTIR BOOKINGS A EVENTOS ====================
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

  // ==================== EVENTOS DEL FILTRO ====================
  onCompanyChange(companyId: number | null): void {
    if (!this.isOwner) {
      console.warn('⚠️ Solo OWNER puede cambiar compañía');
      return;
    }
    console.log('🏢 Cambiando compañía a:', companyId);
    this.selectedCompanyId = companyId;
    this.selectedSupplierId = null;
    this.applyFiltersAndLoad();
  }

  onSupplierChange(supplierId: number | null): void {
    if (this.isUser) {
      console.warn('⚠️ USER no puede cambiar supplier (está fijo)');
      return;
    }
    console.log('👤 Cambiando supplier a:', supplierId);
    this.selectedSupplierId = supplierId;
    this.applyFiltersAndLoad();
  }

  onViewModeChange(mode: ViewMode): void {
    console.log('📱 Cambiando vista a:', mode);
    this.viewMode = mode;
    // Al cambiar a calendario, asegurar que los eventos estén actualizados
    if (mode === 'calendar' && this.selectedSupplierId) {
      // Ya están cargados en this.events
    }
    this.cdr.detectChanges();
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
  console.log('➕ Abriendo modal de creación');
  
  let defaultCompanyId = 0;
  let defaultSupplierId = this.selectedSupplierId || 0;
  
  // 🔴 Obtener companyId del supplier seleccionado
  if (this.selectedSupplierId) {
    const supplier = this.allSuppliers.find(s => s.supplier?.id === this.selectedSupplierId);
    if (supplier) {
      defaultCompanyId = supplier.person.companyId;
    }
  }
  
  // Si no hay supplier seleccionado pero es USER, usar su compañía
  if (defaultCompanyId === 0 && this.isUser && this.currentUser?.personId) {
    const userSupplier = this.allSuppliers.find(s => s.person.id === this.currentUser!.personId);
    if (userSupplier) {
      defaultCompanyId = userSupplier.person.companyId;
      defaultSupplierId = userSupplier.supplier?.id || 0;
    }
  }
  
  // Fallback: usar compañía del usuario
  if (defaultCompanyId === 0) {
    defaultCompanyId = this.currentUser?.companyId || 0;
  }
  
  const now = new Date();
  const end = new Date(now.getTime() + 60 * 60 * 1000);
  
  this.createFormData = {
    companyId: defaultCompanyId,
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
    if (!data.companyId || data.companyId === 0) {
      const supplier = this.allSuppliers.find(s => s.supplier?.id === this.selectedSupplierId);
      if (supplier) {
        data.companyId = supplier.person.companyId;
      } else {
        alert('❌ Error: No se pudo determinar la compañía.');
        return;
      }
    }
    
    this.loading = true;
    this.bookingService.create(data).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loading = false;
        if (this.selectedSupplierId) {
          this.loadBookings(this.selectedSupplierId);
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

  // ==================== MODAL - DETALLE / EDICIÓN ====================
  openDetailModal(booking: BookingDTO): void {
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
        console.log('ℹ️ No payment found for booking:', booking.id);
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
    this.loading = true;
    this.bookingService.patch(event.id, { status: event.status }).subscribe({
      next: () => {
        this.loading = false;
        this.closeDetailModal();
        if (this.selectedSupplierId) {
          this.loadBookings(this.selectedSupplierId);
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

  onDeleteBookingFromDetail(id: number): void {
    this.loading = true;
    this.bookingService.delete(id).subscribe({
      next: () => {
        this.loading = false;
        this.closeDetailModal();
        if (this.selectedSupplierId) {
          this.loadBookings(this.selectedSupplierId);
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

  // ==================== MODAL - ELIMINACIÓN (desde lista) ====================
  openDeleteModal(booking: BookingDTO): void {
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
        if (this.selectedSupplierId) {
          this.loadBookings(this.selectedSupplierId);
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

  // ==================== PAGOS (desde detalle) ====================
  onSavePayment(data: PaymentCreateDTO): void {
    this.loadingPayment = true;
    this.paymentService.create(data).subscribe({
      next: (payment) => {
        this.selectedPayment = payment;
        this.loadingPayment = false;
        if (this.selectedSupplierId) {
          this.loadBookings(this.selectedSupplierId);
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
        if (this.selectedSupplierId) {
          this.loadBookings(this.selectedSupplierId);
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
        if (this.selectedSupplierId) {
          this.loadBookings(this.selectedSupplierId);
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
// En BookingsComponent añadir método:
onUpdateBookingFull(event: { id: number; data: BookingPatchDTO }): void {
  console.log('📤 PATCH recibido en padre:', event);
  this.loading = true;
  this.bookingService.patch(event.id, event.data).subscribe({
    next: () => {
      this.loading = false;
      // Cerrar modal de detalle? No, mejor recargar y dejar abierto.
      if (this.selectedSupplierId) {
        this.loadBookings(this.selectedSupplierId);
      }
      // Actualizar el booking seleccionado en el modal?
      // Podríamos recargar el booking y actualizar el objeto
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
  // ==================== HELPERS ====================
  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  // ==================== GETTERS FILTRADOS ====================

get filteredCustomers(): PersonIdentityDTO[] {
  if (!this.selectedSupplierId) return [];
  const supplier = this.allSuppliers.find(s => s.supplier?.id === this.selectedSupplierId);
  if (!supplier) return [];
  const companyId = supplier.person.companyId;
  return this.allCustomers.filter(c => c.person.companyId === companyId);
}

get filteredServices(): ServiceDTO[] {
  if (!this.selectedSupplierId) return [];
  return this.allServices.filter(s => s.supplierId === this.selectedSupplierId);
}
}