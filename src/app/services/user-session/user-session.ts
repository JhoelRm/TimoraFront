import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import {UserSession} from '../../models/userSession';

@Injectable({ providedIn: 'root' })
export class SessionService {

  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<UserSession | null>(null);
  user$ = this.userSubject.asObservable();

  getMe(): Observable<UserSession> {
    return this.http.get<UserSession>('/api/me').pipe(
      tap(user => this.userSubject.next(user))
    );
  }
}