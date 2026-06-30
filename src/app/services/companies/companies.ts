import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyDTO, CompanyPatchDTO, CompanyCreateDTO } from '../../models/company';

export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private baseUrl = '/api/companies';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CompanyDTO[]> {
    return this.http.get<CompanyDTO[]>(this.baseUrl);
  }

  getById(id: number): Observable<CompanyDTO> {
    return this.http.get<CompanyDTO>(`${this.baseUrl}/${id}`);
  }

  create(dto: CompanyCreateDTO): Observable<CompanyDTO> {
    return this.http.post<CompanyDTO>(this.baseUrl, dto);
  }

  patch(id: number, dto: CompanyPatchDTO): Observable<CompanyDTO> {
    return this.http.patch<CompanyDTO>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}