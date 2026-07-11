import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingDTO, BookingCreateDTO, BookingPatchDTO } from '../../models/appointment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = '/api/bookings';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(this.baseUrl);
  }

  getById(id: number): Observable<BookingDTO> {
    return this.http.get<BookingDTO>(`${this.baseUrl}/${id}`);
  }

  getAllBySupplier(supplierId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/supplier/${supplierId}`);
  }

  getAllBySupplierAndRange(supplierId: number, startDate: string, endDate: string): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/supplier/${supplierId}/range?startDate=${startDate}&endDate=${endDate}`);
  }

  getAllByCustomer(customerId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  getAllByService(serviceId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/service/${serviceId}`);
  }

  create(dto: BookingCreateDTO): Observable<BookingDTO> {
    return this.http.post<BookingDTO>(this.baseUrl, dto);
  }

  patch(id: number, data: BookingPatchDTO): Observable<BookingDTO> {
    return this.http.patch<BookingDTO>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  validateOverlap(serviceId: number, startTime: string, endTime: string, excludeId?: number): Observable<void> {
    let url = `${this.baseUrl}/validate-overlap?serviceId=${serviceId}&startTime=${startTime}&endTime=${endTime}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return this.http.get<void>(url);
  }
}
