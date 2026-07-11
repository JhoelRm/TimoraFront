// services/availability/availability.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AvailabilityDTO, 
  AvailabilityCreateDTO, 
  AvailabilityPatchDTO 
} from '../../models/availability';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private baseUrl = '/api/availabilities';

  constructor(private http: HttpClient) {}

  // ==================== CRUD ====================

  create(dto: AvailabilityCreateDTO): Observable<AvailabilityDTO> {
    const cleanData: any = { ...dto };
    
    cleanData.companyId = Number(cleanData.companyId);
    cleanData.supplierId = Number(cleanData.supplierId);
    cleanData.monday = Boolean(cleanData.monday);
    cleanData.tuesday = Boolean(cleanData.tuesday);
    cleanData.wednesday = Boolean(cleanData.wednesday);
    cleanData.thursday = Boolean(cleanData.thursday);
    cleanData.friday = Boolean(cleanData.friday);
    cleanData.saturday = Boolean(cleanData.saturday);
    cleanData.sunday = Boolean(cleanData.sunday);
    cleanData.slotDurationMinutes = Number(cleanData.slotDurationMinutes);
    cleanData.capacity = Number(cleanData.capacity);
    
    console.log('📤 CREATE final:', cleanData);
    return this.http.post<AvailabilityDTO>(this.baseUrl, cleanData);
  }

  patch(id: number, data: AvailabilityPatchDTO): Observable<AvailabilityDTO> {
    const cleanData: any = { ...data };
    
    if (cleanData.monday !== undefined) cleanData.monday = Boolean(cleanData.monday);
    if (cleanData.tuesday !== undefined) cleanData.tuesday = Boolean(cleanData.tuesday);
    if (cleanData.wednesday !== undefined) cleanData.wednesday = Boolean(cleanData.wednesday);
    if (cleanData.thursday !== undefined) cleanData.thursday = Boolean(cleanData.thursday);
    if (cleanData.friday !== undefined) cleanData.friday = Boolean(cleanData.friday);
    if (cleanData.saturday !== undefined) cleanData.saturday = Boolean(cleanData.saturday);
    if (cleanData.sunday !== undefined) cleanData.sunday = Boolean(cleanData.sunday);
    
    if (cleanData.slotDurationMinutes !== undefined) cleanData.slotDurationMinutes = Number(cleanData.slotDurationMinutes);
    if (cleanData.capacity !== undefined) cleanData.capacity = Number(cleanData.capacity);
    
    if (cleanData.status !== undefined) {
      cleanData.status = cleanData.status;
    }
    
    console.log('📤 PATCH final:', cleanData);
    return this.http.patch<AvailabilityDTO>(`${this.baseUrl}/${id}`, cleanData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ==================== GETTERS ====================

  getAllByCompany(): Observable<AvailabilityDTO[]> {
    return this.http.get<AvailabilityDTO[]>(this.baseUrl);
  }

  getAllBySupplier(supplierId: number): Observable<AvailabilityDTO[]> {
    return this.http.get<AvailabilityDTO[]>(`${this.baseUrl}/supplier/${supplierId}`);
  }

  getBySupplierAndDate(supplierId: number, date: string): Observable<AvailabilityDTO[]> {
    return this.http.get<AvailabilityDTO[]>(
      `${this.baseUrl}/supplier/${supplierId}/date?date=${date}`
    );
  }

  getById(id: number): Observable<AvailabilityDTO> {
    return this.http.get<AvailabilityDTO>(`${this.baseUrl}/${id}`);
  }

  // 🔴 ELIMINADO: validateOverlap - ya no se usa
}