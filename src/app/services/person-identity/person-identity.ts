import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonIdentityPatchDTO } from '../../models/person-identity';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private http = inject(HttpClient);

  private baseUrl = '/api/persons';

  getAll(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  patch(id: number, body: PersonIdentityPatchDTO): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, body);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}