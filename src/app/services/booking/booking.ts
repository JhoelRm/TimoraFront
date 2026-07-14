import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  BookingDTO, 
  BookingCreateDTO, 
  BookingPatchDTO 
} from '../../models/booking';
import { environment } from '../../../environments/environment.prod';

@Injectable({ 
  providedIn: 'root' 
})
export class BookingService {
  private baseUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los bookings de la compañía del usuario
   * GET /api/bookings
   */
  getAll(): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(this.baseUrl);
  }

  /**
   * Obtener un booking por ID
   * GET /api/bookings/{id}
   */
  getById(id: number): Observable<BookingDTO> {
    return this.http.get<BookingDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtener bookings por customer
   * GET /api/bookings/customer/{customerId}
   */
  getByCustomer(customerId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  /**
   * Obtener bookings por service
   * GET /api/bookings/service/{serviceId}
   */
  getByService(serviceId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/service/${serviceId}`);
  }

  /**
   * Obtener bookings por supplier
   * GET /api/bookings/supplier/{supplierId}
   */
  getBySupplier(supplierId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/supplier/${supplierId}`);
  }

  /**
   * Obtener bookings por supplier y rango de fechas
   * GET /api/bookings/supplier/{supplierId}/range?startDate=...&endDate=...
   */
  getBySupplierAndRange(
    supplierId: number, 
    startDate: string, 
    endDate: string
  ): Observable<BookingDTO[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<BookingDTO[]>(
      `${this.baseUrl}/supplier/${supplierId}/range`,
      { params }
    );
  }

  /**
   * Crear un nuevo booking
   * POST /api/bookings
   */
  create(dto: BookingCreateDTO): Observable<BookingDTO> {
    return this.http.post<BookingDTO>(this.baseUrl, dto);
  }

  /**
   * Actualizar un booking (PATCH)
   * PATCH /api/bookings/{id}
   */
  patch(id: number, data: BookingPatchDTO): Observable<BookingDTO> {
    return this.http.patch<BookingDTO>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Eliminar un booking (soft delete)
   * DELETE /api/bookings/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Validar solapamiento
   * GET /api/bookings/validate-overlap
   */
  validateOverlap(
    serviceId: number, 
    startTime: string, 
    endTime: string, 
    excludeId?: number
  ): Observable<void> {
    let params = new HttpParams()
      .set('serviceId', serviceId.toString())
      .set('startTime', startTime)
      .set('endTime', endTime);
    
    if (excludeId) {
      params = params.set('excludeId', excludeId.toString());
    }
    
    return this.http.get<void>(`${this.baseUrl}/validate-overlap`, { params });
  }

  // ==================== MÉTODOS UTILITARIOS ====================

  /**
   * Cambiar estado de un booking
   */
  changeStatus(id: number, status: string): Observable<BookingDTO> {
    return this.patch(id, { status: status as any });
  }

  /**
   * Confirmar un booking (PENDING → CONFIRMED)
   */
  confirm(id: number): Observable<BookingDTO> {
    return this.patch(id, { status: 'CONFIRMED' });
  }

  /**
   * Cancelar un booking
   */
  cancel(id: number): Observable<BookingDTO> {
    return this.patch(id, { status: 'CANCELLED' });
  }

  /**
   * Completar un booking
   */
  complete(id: number): Observable<BookingDTO> {
    return this.patch(id, { status: 'COMPLETED' });
  }

  /**
   * Marcar como inactivo un booking
   */
  inactivate(id: number): Observable<BookingDTO> {
    return this.patch(id, { status: 'INACTIVE' });
  }
}