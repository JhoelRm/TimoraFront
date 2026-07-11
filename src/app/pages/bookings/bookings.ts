import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking/booking';
import { PersonService } from '../../services/person-identity/person-identity';
import { AuthService } from '../../services/auth/auth';
import { CompaniesService } from '../../services/companies/companies';
import { ServicesService } from '../../services/service/service';
import { BookingDTO, BookingCreateDTO, BookingPatchDTO, BookingEvent } from '../../models/appointment';
import { PersonIdentityDTO } from '../../models/person-identity';
import { CurrentUser } from '../../models/currentUser';
import { CompanyDTO } from '../../models/company';
import { ServiceDTO } from '../../models/service';
import { LucideAngularModule, X } from 'lucide-angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BookingsFilter } from './components/bookings-filter/bookings-filter';
import { BookingsList } from './components/bookings-list/bookings-list';
import { BookingsCalendar } from './components/bookings-calendar/bookings-calendar';
import { BookingsForm } from './components/bookings-form/bookings-form';

type ViewMode = 'list' | 'calendar';
type CalendarViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DialogModule, ButtonModule, BookingsFilter, BookingsList, BookingsCalendar, BookingsForm],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.scss']
})
export class BookingsComponent implements OnInit {
  icons = { X };

  viewMode: ViewMode = 'list';
  calendarViewMode: CalendarViewMode = 'week';
  bookings: BookingDTO[] = [];
  filteredBookings: BookingDTO[] = [];
  loading = false;
  error: string | null = null;

  currentDate = new Date();
  selectedDate = new Date();
  events: BookingEvent[] = [];

  currentUser: CurrentUser | null = null;
  currentUserSupplier: PersonIdentityDTO | null = null;
  currentCompany: CompanyDTO | null = null;

  allCompanies: CompanyDTO[] = [];
  selectedCompanyId: number | null = null;

  allSuppliers: PersonIdentityDTO[] = [];
  filteredSuppliers: PersonIdentityDTO[] = [];
  selectedSupplierId: number | null = null;

  allCustomers: PersonIdentityDTO[] = [];
  allServices: ServiceDTO[] = [];

  modalOpen = false;
  editModalOpen = false;
  deleteModalOpen = false;
  bookingForm: BookingCreateDTO = this.createEmptyForm();
  editForm: BookingPatchDTO = {};
  editBookingId: number | null = null;
  bookingToDelete: BookingDTO | null = null;

  private bookingService = inject(BookingService);
  private personService = inject(PersonService);
  private authService = inject(AuthService);
  private companiesService = inject(CompaniesService);
  private servicesService = inject(ServicesService);
  private cdr = inject(ChangeDetectorRef);

  get isOwner() { return this.currentUser?.role === 'OWNER'; }
  get isAdmin() { return this.currentUser?.role === 'ADMIN'; }
  get isUser() { return this.currentUser?.role === 'USER'; }
  get canSelectCompany() { return this.isOwner; }
  get canSelectSupplier() { return this.isOwner || this.isAdmin; }

  get totalBookings(): number {
    return this.filteredBookings.length;
  }

  get supplierOptions(): PersonIdentityDTO[] {
    return this.filteredSuppliers;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadCompanies();
    this.loadSuppliers();
    this.loadCustomers();
    this.loadServices();
  }

  // ==================== LOAD DATA ====================

  private loadCompanies(): void {
    this.companiesService.getAll().subscribe({
      next: (companies) => {
        this.allCompanies = companies ?? [];
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

  private loadCustomers(): void {
    this.personService.getAll().subscribe({
      next: (data) => {
        this.allCustomers = (data ?? []).filter(x => x.customer !== null && x.customer !== undefined);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading customers:', err);
      }
    });
  }

  private loadServices(): void {
    this.servicesService.getAll().subscribe({
      next: (data) => {
        this.allServices = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading services:', err);
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
          this.loadBookings();
        }
        this.cdr.detectChanges();
      },
      error: console.error
    });
  }

  loadBookings(): void {
    if (this.isUser) {
      if (!this.currentUserSupplier) {
        this.loadCurrentUserSupplier();
        return;
      }
      if (!this.selectedSupplierId && this.currentUserSupplier) {
        this.selectedSupplierId = this.currentUserSupplier.supplier?.id ?? null;
      }
    }

    if (!this.selectedSupplierId && !this.isUser) {
      this.filteredBookings = [];
      this.events = [];
      return;
    }

    this.loading = true;
    this.error = null;

    let supplierId: number | null = null;

    if (this.isUser && this.currentUserSupplier) {
      supplierId = this.currentUserSupplier.supplier?.id ?? null;
    } else {
      supplierId = this.selectedSupplierId;
    }

    if (!supplierId) {
      this.loading = false;
      return;
    }

    const id = Number(supplierId);
    if (isNaN(id)) {
      this.loading = false;
      this.error = 'Invalid supplier ID';
      return;
    }

    this.bookingService.getAllBySupplier(id).subscribe({
      next: (data) => {
        this.bookings = data;
        this.filteredBookings = data;
        this.events = this.convertToEvents(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.error = 'Failed to load bookings';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== FILTERS ====================

  private applyFilters(): void {
    let suppliers = this.allSuppliers;

    if (this.canSelectCompany && this.selectedCompanyId) {
      suppliers = suppliers.filter(s => s.person.companyId === this.selectedCompanyId);
    }

    if (this.isAdmin) {
      const companyId = this.currentUser?.companyId;
      if (companyId) {
        suppliers = suppliers.filter(s => s.person.companyId === companyId);
      }
    }

    this.filteredSuppliers = suppliers;

    if (this.selectedSupplierId) {
      const stillExists = this.filteredSuppliers.some(s => s.supplier?.id === this.selectedSupplierId);
      if (!stillExists) {
        this.selectedSupplierId = null;
        this.filteredBookings = [];
        this.events = [];
      }
    }

    if (this.isUser) {
      this.loadCurrentUserSupplier();
    }

    this.cdr.detectChanges();
  }

  onCompanyChange(companyId: number | null): void {
    this.selectedCompanyId = companyId;
    this.applyFilters();
    this.selectedSupplierId = null;
    this.filteredBookings = [];
    this.events = [];
    this.cdr.detectChanges();
  }

  onSupplierChange(supplierId: number | null): void {
    this.selectedSupplierId = supplierId;
    this.loadBookings();
  }

  // ==================== EVENTS CONVERSION ====================

  convertToEvents(data: BookingDTO[]): BookingEvent[] {
    return data.map(item => {
      const start = new Date(item.startTime);
      const end = new Date(item.endTime);

      return {
        id: item.id,
        title: item.name || `Booking #${item.id}`,
        description: item.description || '',
        customerName: this.getCustomerName(item.customerId),
        serviceName: this.getServiceName(item.serviceId),
        start: start,
        end: end,
        status: item.status,
        type: item.type
      };
    });
  }

  getCustomerName(customerId: number): string {
    const customer = this.allCustomers.find(c => c.customer?.id === customerId);
    if (customer) return `${customer.person.firstName} ${customer.person.lastName}`;
    return `Cliente #${customerId}`;
  }

  getServiceName(serviceId: number): string {
    const service = this.allServices.find(s => s.id === serviceId);
    return service?.name || `Servicio #${serviceId}`;
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

  setViewMode(mode: ViewMode): void {
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

  selectDay(date: Date): void {
    this.selectedDate = date;
    if (this.calendarViewMode === 'month' || this.calendarViewMode === 'week') {
      this.calendarViewMode = 'day';
    }
    this.cdr.detectChanges();
  }

  // ==================== CRUD OPERATIONS ====================

  openCreateModal(): void {
    this.bookingForm = this.createEmptyForm();

    if (this.isUser && this.currentUserSupplier) {
      this.bookingForm.companyId = this.currentUserSupplier.person.companyId;
    } else if (this.selectedCompanyId) {
      this.bookingForm.companyId = this.selectedCompanyId;
    }

    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  createBooking(): void {
    const form = this.bookingForm;

    if (!form.companyId || form.companyId === 0) {
      alert('Company ID is required');
      return;
    }
    if (form.customerId === 0) {
      alert('Please select a customer');
      return;
    }
    if (form.serviceId === 0) {
      alert('Please select a service');
      return;
    }
    if (!form.startTime || !form.endTime) {
      alert('Please select start and end date/time');
      return;
    }

    const startDate = new Date(form.startTime);
    const endDate = new Date(form.endTime);
    if (endDate <= startDate) {
      alert('End time must be after start time');
      return;
    }

    this.loading = true;
    this.bookingService.create(form).subscribe({
      next: () => {
        this.modalOpen = false;
        this.loadBookings();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating booking:', err);
        alert('Failed to create booking: ' + (err.error?.message || err.message));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openEditModal(booking: BookingDTO): void {
    this.editBookingId = booking.id;
    this.editForm = {
      name: booking.name,
      description: booking.description,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      type: booking.type
    };
    this.editModalOpen = true;
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.editBookingId = null;
  }

  updateBooking(): void {
    if (!this.editBookingId) return;

    const id = Number(this.editBookingId);
    if (isNaN(id)) {
      alert('Invalid booking ID');
      return;
    }

    this.loading = true;
    this.bookingService.patch(id, this.editForm).subscribe({
      next: () => {
        this.editModalOpen = false;
        this.editBookingId = null;
        this.loadBookings();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating booking:', err);
        alert('Failed to update booking: ' + (err.error?.message || err.message));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal(booking: BookingDTO): void {
    this.bookingToDelete = booking;
    this.deleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
    this.bookingToDelete = null;
  }

  confirmDelete(): void {
    if (!this.bookingToDelete) return;

    const id = Number(this.bookingToDelete.id);
    if (isNaN(id)) {
      alert('Invalid booking ID');
      return;
    }

    this.loading = true;
    this.bookingService.delete(id).subscribe({
      next: () => {
        this.deleteModalOpen = false;
        this.bookingToDelete = null;
        this.loadBookings();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting booking:', err);
        alert('Failed to delete booking: ' + (err.error?.message || err.message));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==================== HELPERS ====================

  createEmptyForm(): BookingCreateDTO {
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000);

    return {
      companyId: this.currentUser?.companyId || 0,
      serviceId: 0,
      customerId: 0,
      startTime: this.formatDateTimeLocal(now),
      endTime: this.formatDateTimeLocal(end),
      type: 'APPOINTMENT',
      name: '',
      description: ''
    };
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  trackBySupplierId(index: number, item: PersonIdentityDTO): number {
    return item.supplier?.id ?? index;
  }

  trackByBookingId(index: number, item: BookingDTO): number {
    return item.id;
  }

  trackByEventId(index: number, item: BookingEvent): number {
    return item.id;
  }

  trackByCompanyId(index: number, item: CompanyDTO): number {
    return item.id;
  }
}
