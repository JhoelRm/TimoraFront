import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceDTO, ServiceCreateDTO, ServicePatchDTO } from '../../models/service';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/services`;

  getAll(): Observable<ServiceDTO[]> {
    console.log('GET request to:', this.baseUrl);
    return this.http.get<ServiceDTO[]>(this.baseUrl);
  }

  getById(id: number): Observable<ServiceDTO> {
    return this.http.get<ServiceDTO>(`${this.baseUrl}/${id}`);
  }

  create(body: ServiceCreateDTO): Observable<ServiceDTO> {
    console.log('POST request to:', this.baseUrl);
    console.log('Body:', body);
    return this.http.post<ServiceDTO>(this.baseUrl, body);
  }

  patch(id: number, body: ServicePatchDTO): Observable<ServiceDTO> {
    return this.http.patch<ServiceDTO>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}