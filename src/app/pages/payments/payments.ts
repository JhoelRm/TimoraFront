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
    const result = this.allPayments().filter(p => p.status !== 'DELETED');
    console.log('📊 visiblePayments computed:', {
      total: this.allPayments().length,
      visible: result.length,
      deleted: this.allPayments().length - result.length
    });
    return result;
  });

  totalRevenue = computed(() => {
    const paid = this.visiblePayments().filter(p => p.status === 'PAID');
    const total = paid.reduce((sum, p) => sum + p.amount, 0);
    console.log('💰 totalRevenue computed:', {
      paidPayments: paid.length,
      total: total
    });
    return total;
  });

  totalPending = computed(() => {
    const pending = this.visiblePayments()
      .filter(p => p.status === 'PENDING' || p.status === 'PARTIALLY_PAID');
    const total = pending.reduce((sum, p) => sum + p.amount, 0);
    console.log('⏳ totalPending computed:', {
      pendingPayments: pending.length,
      total: total
    });
    return total;
  });

  transactionCount = computed(() => {
    const count = this.visiblePayments().length;
    console.log('📝 transactionCount computed:', count);
    return count;
  });

  paymentRows = computed<PaymentRow[]>(() => {
    console.log('🔍 === CALCULANDO PAYMENT ROWS ===');
    
    const payments = this.visiblePayments();
    const bookings = this.bookingsMap();
    const persons = this.personsMap();
    const services = this.servicesMap();

    console.log('📊 Datos disponibles:');
    console.log('  - Pagos visibles:', payments.length);
    console.log('  - Bookings en mapa:', bookings.size);
    console.log('  - Persons en mapa:', persons.size);
    console.log('  - Services en mapa:', services.size);

    // Mostrar primeros 3 pagos para depuración
    if (payments.length > 0) {
      console.log('📋 Primeros 3 pagos (raw):', payments.slice(0, 3).map(p => ({
        id: p.id,
        bookingId: p.bookingId,
        amount: p.amount,
        status: p.status
      })));
    }

    const result = payments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(p => {
        const booking = bookings.get(p.bookingId);
        let clientName = 'Cliente';
        let serviceName = 'Servicio';

        if (booking) {
          const person = persons.get(booking.customerId);
          const service = services.get(booking.serviceId);
          
          if (person) {
            clientName = `${person.person.firstName} ${person.person.lastName}`.trim();
          } else {
            console.warn(`⚠️ Persona no encontrada para customerId: ${booking.customerId} (booking ${booking.id})`);
          }
          
          if (service) {
            serviceName = service.name;
          } else {
            console.warn(`⚠️ Servicio no encontrado para serviceId: ${booking.serviceId} (booking ${booking.id})`);
          }
        } else {
          console.warn(`⚠️ Booking no encontrado para payment ${p.id} con bookingId: ${p.bookingId}`);
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

    console.log('✅ Payment rows generados:', result.length);
    if (result.length > 0) {
      console.log('📋 Primeros 3 payment rows:', result.slice(0, 3));
    }
    
    return result;
  });

  ngOnInit(): void {
    console.log('🚀 PaymentsComponent inicializado');
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    console.log('🔄 Iniciando carga de datos...');

    forkJoin({
      payments: this.paymentsService.getAll(),
      bookings: this.bookingsService.getAll(),
      persons: this.personService.getAll(),
      services: this.servicesService.getAll(),
    }).subscribe({
      next: ({ payments, bookings, persons, services }) => {
        console.log('✅ === DATOS RECIBIDOS ===');
        
        // Payments
        console.log('📦 Payments recibidos:', payments?.length ?? 0);
        if (payments && payments.length > 0) {
          console.log('  - Primer pago:', payments[0]);
          console.log('  - Último pago:', payments[payments.length - 1]);
          // Estadísticas de estados
          const stats = payments.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          console.log('  - Estados:', stats);
        } else {
          console.warn('⚠️ No se recibieron pagos');
        }
        
        // Bookings
        console.log('📦 Bookings recibidos:', bookings?.length ?? 0);
        if (bookings && bookings.length > 0) {
          console.log('  - Primer booking:', bookings[0]);
        } else {
          console.warn('⚠️ No se recibieron bookings');
        }
        
        // Persons
        console.log('📦 Persons recibidos:', persons?.length ?? 0);
        if (persons && persons.length > 0) {
          console.log('  - Primer person:', persons[0]);
        } else {
          console.warn('⚠️ No se recibieron persons');
        }
        
        // Services
        console.log('📦 Services recibidos:', services?.length ?? 0);
        if (services && services.length > 0) {
          console.log('  - Primer service:', services[0]);
        } else {
          console.warn('⚠️ No se recibieron services');
        }

        // Actualizar signals
        this.allPayments.set(payments ?? []);
        console.log('✅ allPayments actualizado:', this.allPayments().length);

        const bMap = new Map<number, BookingDTO>();
        (bookings ?? []).forEach(b => bMap.set(b.id, b));
        this.bookingsMap.set(bMap);
        console.log('✅ bookingsMap actualizado:', this.bookingsMap().size);

        const pMap = new Map<number, PersonIdentityDTO>();
        (persons ?? []).forEach(p => pMap.set(p.person.id, p));
        this.personsMap.set(pMap);
        console.log('✅ personsMap actualizado:', this.personsMap().size);

        const sMap = new Map<number, ServiceDTO>();
        (services ?? []).forEach(s => sMap.set(s.id, s));
        this.servicesMap.set(sMap);
        console.log('✅ servicesMap actualizado:', this.servicesMap().size);

        console.log('🔍 Verificando relaciones:');
        // Verificar cuántos bookings tienen customer en personsMap
        if (bookings && bookings.length > 0) {
          let found = 0;
          let missing = 0;
          bookings.forEach(b => {
            if (pMap.has(b.customerId)) {
              found++;
            } else {
              missing++;
            }
          });
          console.log(`  - Bookings con customer en personsMap: ${found}/${bookings.length}`);
          if (missing > 0) {
            console.warn(`⚠️ ${missing} bookings tienen customerId que no está en personsMap`);
          }
        }

        this.loading.set(false);
        console.log('✅ Carga completada, loading = false');
      },
      error: (err) => {
        console.error('❌ Error loading payments data:', err);
        console.error('  - Status:', err.status);
        console.error('  - Message:', err.message);
        console.error('  - Error object:', err.error);
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