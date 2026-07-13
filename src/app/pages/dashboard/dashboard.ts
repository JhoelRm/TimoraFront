import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth/auth';
import { SessionService } from '../../services/user-session/user-session';
import { BookingService } from '../../services/booking/booking';
import { PaymentService } from '../../services/payment/payment';
import { PersonService } from '../../services/person-identity/person-identity';
import { ServicesService } from '../../services/service/service';
import { BookingDTO } from '../../models/booking';
import { PaymentDTO } from '../../models/payment';
import { PersonIdentityDTO } from '../../models/person-identity';
import { ServiceDTO } from '../../models/service';

interface RecentBooking {
  clientName: string;
  serviceName: string;
  date: Date;
  status: string;
  initial: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {

  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private bookingsService = inject(BookingService);
  private paymentsService = inject(PaymentService);
  private personService = inject(PersonService);
  private servicesService = inject(ServicesService);

  loading = signal(true);
  userName = signal('');
  greeting = signal('');
  currentDate = signal('');
  role = signal('');

  allBookings = signal<BookingDTO[]>([]);
  allPayments = signal<PaymentDTO[]>([]);
  personsMap = signal<Map<number, PersonIdentityDTO>>(new Map());
  servicesMap = signal<Map<number, ServiceDTO>>(new Map());

  totalBookings = computed(() => {
    return this.allBookings().filter(
      b => b.status !== 'CANCELLED' && b.status !== 'DELETED' && b.status !== 'INACTIVE'
    ).length;
  });

  confirmedCount = computed(() => {
    return this.allBookings().filter(b => b.status === 'CONFIRMED').length;
  });

  pendingBookings = computed(() => {
    return this.allBookings().filter(b => b.status === 'PENDING').length;
  });

  totalRevenue = computed(() => {
    return this.allPayments()
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
  });

  paidInvoicesCount = computed(() => {
    return this.allPayments().filter(p => p.status === 'PAID').length;
  });

  pendingPaymentsCount = computed(() => {
    return this.allPayments().filter(p => p.status === 'PENDING').length;
  });

  completedCount = computed(() => {
    return this.allBookings().filter(b => b.status === 'COMPLETED').length;
  });

  activeClientsCount = computed(() => {
    const activeBookings = this.allBookings().filter(
      b => b.status !== 'CANCELLED' && b.status !== 'DELETED' && b.status !== 'INACTIVE'
    );
    const uniqueIds = new Set(activeBookings.map(b => b.customerId));
    return uniqueIds.size;
  });

  confirmedThisWeek = computed(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return this.allBookings().filter(b => {
      if (b.status !== 'CONFIRMED') return false;
      const d = new Date(b.startTime);
      return d >= weekStart && d < weekEnd;
    }).length;
  });

  recentBookings = computed<RecentBooking[]>(() => {
    const bookings = this.allBookings()
      .filter(b => b.status !== 'DELETED' && b.status !== 'INACTIVE')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 6);

    const persons = this.personsMap();
    const services = this.servicesMap();

    return bookings.map(b => {
      const person = persons.get(b.customerId);
      const service = services.get(b.serviceId);
      const firstName = person?.person?.firstName ?? 'Cliente';
      const lastName = person?.person?.lastName ?? '';
      const serviceName = service?.name ?? 'Servicio';

      return {
        clientName: `${firstName} ${lastName}`.trim(),
        serviceName,
        date: new Date(b.startTime),
        status: b.status,
        initial: firstName.charAt(0).toUpperCase(),
      };
    });
  });

  ngOnInit(): void {
    this.setGreeting();
    this.loadData();
  }

  private setGreeting(): void {
    const session = this.sessionService.getSnapshot();
    const firstName = session?.firstName ?? '';
    this.userName.set(firstName);
    this.role.set(session?.role ?? '');

    const hour = new Date().getHours();
    let saludo = 'Buenos días';
    if (hour >= 12 && hour < 18) saludo = 'Buenas tardes';
    else if (hour >= 18) saludo = 'Buenas noches';

    this.greeting.set(`${saludo}, ${firstName}`);

    const now = new Date();
    this.currentDate.set(
      now.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }

  private loadData(): void {
    this.loading.set(true);

    forkJoin({
      bookings: this.bookingsService.getAll(),
      payments: this.paymentsService.getAll(),
      persons: this.personService.getAll(),
      services: this.servicesService.getAll(),
    }).subscribe({
      next: ({ bookings, payments, persons, services }) => {
        this.allBookings.set(bookings ?? []);
        this.allPayments.set(payments ?? []);

        const pMap = new Map<number, PersonIdentityDTO>();
        (persons ?? []).forEach(p => pMap.set(p.person.id, p));
        this.personsMap.set(pMap);

        const sMap = new Map<number, ServiceDTO>();
        (services ?? []).forEach(s => sMap.set(s.id, s));
        this.servicesMap.set(sMap);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-400';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-400';
      case 'PENDING': return 'bg-amber-500/10 text-amber-400';
      case 'CANCELLED': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'COMPLETED': return 'Completada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' · ' + date.toLocaleTimeString('es-PE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatCurrency(amount: number): string {
    return `S/. ${amount.toFixed(2)}`;
  }
}
