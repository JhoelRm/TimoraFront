import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import { UserSession } from '../../models/userSession';

@Injectable({ providedIn: 'root' })
export class SessionService {

  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<UserSession | null>(
    this.loadFromStorage()
  );

  user$ = this.userSubject.asObservable();

  getMe(): Observable<UserSession> {
    return this.http.get<UserSession>('/api/me').pipe(
      tap(user => {
        this.userSubject.next(user);
        localStorage.setItem('session', JSON.stringify(user));
      })
    );
  }

  private loadFromStorage(): UserSession | null {
    const raw = localStorage.getItem('session');
    return raw ? JSON.parse(raw) : null;
  }

  clear() {
    localStorage.removeItem('session');
    this.userSubject.next(null);
  }
}