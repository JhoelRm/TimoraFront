// services/availabilities/availability.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvailabilityDTO, AvailabilityCreateDTO, AvailabilityPatchDTO } from '../../models/availability';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private baseUrl = '/api/availabilities';

  constructor(private http: HttpClient) {}

  create(dto: AvailabilityCreateDTO): Observable<AvailabilityDTO> {
    return this.http.post<AvailabilityDTO>(this.baseUrl, dto);
  }

  patch(id: number, dto: AvailabilityPatchDTO): Observable<AvailabilityDTO> {
    return this.http.patch<AvailabilityDTO>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllByCompany(): Observable<AvailabilityDTO[]> {
    return this.http.get<AvailabilityDTO[]>(this.baseUrl);
  }

  getAllBySupplier(supplierId: number): Observable<AvailabilityDTO[]> {
    return this.http.get<AvailabilityDTO[]>(`${this.baseUrl}/supplier/${supplierId}`);
  }

  getBySupplierAndDate(supplierId: number, date: string): Observable<AvailabilityDTO[]> {
    return this.http.get<AvailabilityDTO[]>(`${this.baseUrl}/supplier/${supplierId}/date?date=${date}`);
  }

  getById(id: number): Observable<AvailabilityDTO> {
    return this.http.get<AvailabilityDTO>(`${this.baseUrl}/${id}`);
  }

  validateOverlap(
    supplierId: number,
    startDate: string,
    endDate: string,
    excludeId?: number
  ): Observable<void> {
    let url = `${this.baseUrl}/validate-overlap?supplierId=${supplierId}&startDate=${startDate}&endDate=${endDate}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return this.http.get<void>(url);
  }
}