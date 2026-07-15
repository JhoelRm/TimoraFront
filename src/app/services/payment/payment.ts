import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { 
  PaymentCreateDTO, 
  PaymentDTO, 
  PaymentPatchDTO,
  PaymentStatus
} from '../../models/payment';
import { environment } from '../../../environments/environment.prod';

@Injectable({ 
  providedIn: 'root' 
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo pago
   * POST /api/payments
   */
  create(dto: PaymentCreateDTO): Observable<PaymentDTO> {
    console.log('💳 [PaymentService] CREATE');
    console.log('📦 DTO:', dto);
    console.log('📡 URL:', this.baseUrl);
    
    return this.http.post<PaymentDTO>(this.baseUrl, dto).pipe(
      tap({
        next: (data) => {
          console.log('✅ [PaymentService] CREATE éxito:', data);
        },
        error: (err) => {
          console.error('❌ [PaymentService] CREATE error:', err);
          console.error('  - Status:', err.status);
          console.error('  - Message:', err.message);
          console.error('  - Error:', err.error);
        }
      })
    );
  }

  /**
   * Actualizar un pago (PATCH)
   * PATCH /api/payments/{id}
   */
  patch(id: number, data: PaymentPatchDTO): Observable<PaymentDTO> {
    console.log(`🔄 [PaymentService] PATCH id=${id}`);
    console.log('📦 Data:', data);
    console.log('📡 URL:', `${this.baseUrl}/${id}`);
    
    return this.http.patch<PaymentDTO>(`${this.baseUrl}/${id}`, data).pipe(
      tap({
        next: (data) => {
          console.log(`✅ [PaymentService] PATCH ${id} éxito:`, data);
        },
        error: (err) => {
          console.error(`❌ [PaymentService] PATCH ${id} error:`, err);
          console.error('  - Status:', err.status);
          console.error('  - Message:', err.message);
          console.error('  - Error:', err.error);
        }
      })
    );
  }

  /**
   * Eliminar un pago (soft delete)
   * DELETE /api/payments/{id}
   */
  delete(id: number): Observable<void> {
    console.log(`🗑️ [PaymentService] DELETE id=${id}`);
    console.log('📡 URL:', `${this.baseUrl}/${id}`);
    
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: (data) => {
          console.log(`✅ [PaymentService] DELETE ${id} éxito:`, data);
        },
        error: (err) => {
          console.error(`❌ [PaymentService] DELETE ${id} error:`, err);
          console.error('  - Status:', err.status);
          console.error('  - Message:', err.message);
          console.error('  - Error:', err.error);
        }
      })
    );
  }

  /**
   * Obtener todos los pagos de la compañía
   * GET /api/payments
   */
  getAll(): Observable<PaymentDTO[]> {
    console.log('📋 [PaymentService] GET ALL');
    console.log('📡 URL:', this.baseUrl);
    
    return this.http.get<PaymentDTO[]>(this.baseUrl).pipe(
      tap({
        next: (data) => {
          console.log(`✅ [PaymentService] GET ALL éxito: ${data?.length ?? 0} pagos`);
          if (data && data.length > 0) {
            console.log('  - Primer pago:', data[0]);
            console.log('  - Último pago:', data[data.length - 1]);
            
            // Estadísticas de estados
            const stats = data.reduce((acc, p) => {
              acc[p.status] = (acc[p.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            console.log('  - Estados:', stats);
          } else {
            console.warn('⚠️ No se recibieron pagos');
          }
        },
        error: (err) => {
          console.error('❌ [PaymentService] GET ALL error:', err);
          console.error('  - Status:', err.status);
          console.error('  - Message:', err.message);
          console.error('  - Error:', err.error);
        }
      })
    );
  }

  /**
   * Obtener un pago por ID
   * GET /api/payments/{id}
   */
  getById(id: number): Observable<PaymentDTO> {
    console.log(`🔍 [PaymentService] GET BY ID: ${id}`);
    console.log('📡 URL:', `${this.baseUrl}/${id}`);
    
    return this.http.get<PaymentDTO>(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: (data) => {
          console.log(`✅ [PaymentService] GET BY ID ${id} éxito:`, data);
        },
        error: (err) => {
          console.error(`❌ [PaymentService] GET BY ID ${id} error:`, err);
          console.error('  - Status:', err.status);
          console.error('  - Message:', err.message);
          console.error('  - Error:', err.error);
        }
      })
    );
  }

  /**
   * Obtener pago por bookingId
   * GET /api/payments/booking/{bookingId}
   */
  getByBookingId(bookingId: number): Observable<PaymentDTO> {
    console.log(`🔍 [PaymentService] GET BY BOOKING ID: ${bookingId}`);
    console.log('📡 URL:', `${this.baseUrl}/booking/${bookingId}`);
    
    return this.http.get<PaymentDTO>(`${this.baseUrl}/booking/${bookingId}`).pipe(
      tap({
        next: (data) => {
          if (data) {
            console.log(`✅ [PaymentService] GET BY BOOKING ${bookingId} éxito:`, data);
          } else {
            console.log(`ℹ️ [PaymentService] GET BY BOOKING ${bookingId}: no payment found`);
          }
        },
        error: (err) => {
          console.error(`❌ [PaymentService] GET BY BOOKING ${bookingId} error:`, err);
          console.error('  - Status:', err.status);
          console.error('  - Message:', err.message);
          console.error('  - Error:', err.error);
        }
      })
    );
  }

  /**
   * Obtener pagos por estado
   * GET /api/payments/status?status=PAID
   */
  getByStatus(status: PaymentStatus): Observable<PaymentDTO[]> {
    console.log(`🔍 [PaymentService] GET BY STATUS: ${status}`);
    const params = new HttpParams().set('status', status);
    console.log('📡 URL:', `${this.baseUrl}/status`, 'Params:', params.toString());
    
    return this.http.get<PaymentDTO[]>(`${this.baseUrl}/status`, { params }).pipe(
      tap({
        next: (data) => {
          console.log(`✅ [PaymentService] GET BY STATUS ${status} éxito: ${data?.length ?? 0} pagos`);
        },
        error: (err) => {
          console.error(`❌ [PaymentService] GET BY STATUS ${status} error:`, err);
          console.error('  - Status:', err.status);
          console.error('  - Message:', err.message);
          console.error('  - Error:', err.error);
        }
      })
    );
  }

  // ==================== MÉTODOS UTILITARIOS ====================

  /**
   * Marcar un pago como PAID
   */
  markAsPaid(id: number): Observable<PaymentDTO> {
    console.log(`💳 [PaymentService] MARK AS PAID: ${id}`);
    return this.patch(id, { status: 'PAID' });
  }

  /**
   * Marcar un pago como FAILED
   */
  markAsFailed(id: number): Observable<PaymentDTO> {
    console.log(`❌ [PaymentService] MARK AS FAILED: ${id}`);
    return this.patch(id, { status: 'FAILED' });
  }

  /**
   * Marcar un pago como REFUNDED
   */
  markAsRefunded(id: number): Observable<PaymentDTO> {
    console.log(`🔄 [PaymentService] MARK AS REFUNDED: ${id}`);
    return this.patch(id, { status: 'REFUNDED' });
  }

  /**
   * Marcar un pago como CANCELLED
   */
  markAsCancelled(id: number): Observable<PaymentDTO> {
    console.log(`🚫 [PaymentService] MARK AS CANCELLED: ${id}`);
    return this.patch(id, { status: 'CANCELLED' });
  }
}