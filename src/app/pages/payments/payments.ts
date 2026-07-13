import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PaymentService } from '../../services/payment/payment';
import { BookingService } from '../../services/booking/booking';
import { PersonService } from '../../services/person-identity/person-identity';
import { ServicesService } from '../../services/service/service';
import { PaymentDTO } from '../../models/payment';
import { BookingDTO } from '../../models/booking';
import { PersonIdentityDTO } from '../../models/person-identity';
import { ServiceDTO } from '../../models/service';

interface PaymentRow {
  id: number;
  clientName: string;
  serviceName: string;
  amount: number;
  method: string;
  status: string;
  date: Date;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class PaymentsComponent implements OnInit {

  private paymentsService = inject(PaymentService);
  private bookingsService = inject(BookingService);
  private personService = inject(PersonService);
  private servicesService = inject(ServicesService);

  loading = signal(true);

  allPayments = signal<PaymentDTO[]>([]);
  bookingsMap = signal<Map<number, BookingDTO>>(new Map());
  personsMap = signal<Map<number, PersonIdentityDTO>>(new Map());
  servicesMap = signal<Map<number, ServiceDTO>>(new Map());

  visiblePayments = computed(() => {
    return this.allPayments().filter(p => p.status !== 'DELETED');
  });

  totalRevenue = computed(() => {
    return this.visiblePayments()
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);
  });

  totalPending = computed(() => {
    return this.visiblePayments()
      .filter(p => p.status === 'PENDING' || p.status === 'PARTIALLY_PAID')
      .reduce((sum, p) => sum + p.amount, 0);
  });

  transactionCount = computed(() => this.visiblePayments().length);

  paymentRows = computed<PaymentRow[]>(() => {
    const payments = this.visiblePayments();
    const bookings = this.bookingsMap();
    const persons = this.personsMap();
    const services = this.servicesMap();

    return payments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(p => {
        const booking = bookings.get(p.bookingId);
        let clientName = 'Cliente';
        let serviceName = 'Servicio';

        if (booking) {
          const person = persons.get(booking.customerId);
          const service = services.get(booking.serviceId);
          clientName = person ? `${person.person.firstName} ${person.person.lastName}`.trim() : 'Cliente';
          serviceName = service?.name ?? 'Servicio';
        }

        return {
          id: p.id,
          clientName,
          serviceName,
          amount: p.amount,
          method: p.method,
          status: p.status,
          date: new Date(p.createdAt),
        };
      });
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);

    forkJoin({
      payments: this.paymentsService.getAll(),
      bookings: this.bookingsService.getAll(),
      persons: this.personService.getAll(),
      services: this.servicesService.getAll(),
    }).subscribe({
      next: ({ payments, bookings, persons, services }) => {
        this.allPayments.set(payments ?? []);

        const bMap = new Map<number, BookingDTO>();
        (bookings ?? []).forEach(b => bMap.set(b.id, b));
        this.bookingsMap.set(bMap);

        const pMap = new Map<number, PersonIdentityDTO>();
        (persons ?? []).forEach(p => pMap.set(p.person.id, p));
        this.personsMap.set(pMap);

        const sMap = new Map<number, ServiceDTO>();
        (services ?? []).forEach(s => sMap.set(s.id, s));
        this.servicesMap.set(sMap);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments data:', err);
        this.loading.set(false);
      },
    });
  }

  formatCurrency(amount: number): string {
    return `S/. ${amount.toFixed(2)}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400';
      case 'PENDING': return 'bg-amber-500/10 text-amber-400';
      case 'PARTIALLY_PAID': return 'bg-amber-500/10 text-amber-400';
      case 'FAILED': return 'bg-red-500/10 text-red-400';
      case 'REFUNDED': return 'bg-blue-500/10 text-blue-400';
      case 'CANCELLED': return 'bg-gray-500/10 text-gray-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID': return 'Pagado';
      case 'PENDING': return 'Pendiente';
      case 'PARTIALLY_PAID': return 'Parcial';
      case 'FAILED': return 'Fallido';
      case 'REFUNDED': return 'Reembolsado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  getMethodLabel(method: string): string {
    return method.replace(/_/g, ' ');
  }
}
