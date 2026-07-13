import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  PaymentCreateDTO, 
  PaymentDTO, 
  PaymentPatchDTO,
  PaymentStatus
} from '../../models/payment';

@Injectable({ 
  providedIn: 'root' 
})
export class PaymentService {
  private baseUrl = '/api/payments';

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo pago
   * POST /api/payments
   */
  create(dto: PaymentCreateDTO): Observable<PaymentDTO> {
    return this.http.post<PaymentDTO>(this.baseUrl, dto);
  }

  /**
   * Actualizar un pago (PATCH)
   * PATCH /api/payments/{id}
   */
  patch(id: number, data: PaymentPatchDTO): Observable<PaymentDTO> {
    return this.http.patch<PaymentDTO>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Eliminar un pago (soft delete)
   * DELETE /api/payments/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtener todos los pagos de la compañía
   * GET /api/payments
   */
  getAll(): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>(this.baseUrl);
  }

  /**
   * Obtener un pago por ID
   * GET /api/payments/{id}
   */
  getById(id: number): Observable<PaymentDTO> {
    return this.http.get<PaymentDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtener pago por bookingId
   * GET /api/payments/booking/{bookingId}
   */
  getByBookingId(bookingId: number): Observable<PaymentDTO> {
    return this.http.get<PaymentDTO>(`${this.baseUrl}/booking/${bookingId}`);
  }

  /**
   * Obtener pagos por estado
   * GET /api/payments/status?status=PAID
   */
  getByStatus(status: PaymentStatus): Observable<PaymentDTO[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<PaymentDTO[]>(`${this.baseUrl}/status`, { params });
  }

  // ==================== MÉTODOS UTILITARIOS ====================

  /**
   * Marcar un pago como PAID
   */
  markAsPaid(id: number): Observable<PaymentDTO> {
    return this.patch(id, { status: 'PAID' });
  }

  /**
   * Marcar un pago como FAILED
   */
  markAsFailed(id: number): Observable<PaymentDTO> {
    return this.patch(id, { status: 'FAILED' });
  }

  /**
   * Marcar un pago como REFUNDED
   */
  markAsRefunded(id: number): Observable<PaymentDTO> {
    return this.patch(id, { status: 'REFUNDED' });
  }

  /**
   * Marcar un pago como CANCELLED
   */
  markAsCancelled(id: number): Observable<PaymentDTO> {
    return this.patch(id, { status: 'CANCELLED' });
  }
}