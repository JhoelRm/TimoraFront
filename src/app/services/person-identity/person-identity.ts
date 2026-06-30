import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PersonIdentityCreateDTO,
  PersonIdentityPatchDTO,
  PersonIdentityDTO
} from '../../models/person-identity';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private http = inject(HttpClient);
  private baseUrl = '/api/persons';

  getAll(): Observable<PersonIdentityDTO[]> {
    return this.http.get<PersonIdentityDTO[]>(this.baseUrl);
  }

  getById(id: number): Observable<PersonIdentityDTO> {
    return this.http.get<PersonIdentityDTO>(`${this.baseUrl}/${id}`);
  }

  create(body: PersonIdentityCreateDTO): Observable<PersonIdentityDTO> {
    return this.http.post<PersonIdentityDTO>(this.baseUrl, body);
  }

  patch(id: number, body: PersonIdentityPatchDTO): Observable<PersonIdentityDTO> {
    return this.http.patch<PersonIdentityDTO>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}