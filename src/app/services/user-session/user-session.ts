import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserSession } from '../../models/userSession';

@Injectable({ providedIn: 'root' })
export class SessionService {

  private http = inject(HttpClient);

  private readonly STORAGE_KEY = 'session';

  private userSubject = new BehaviorSubject<UserSession | null>(
    this.loadFromStorage()
  );

  user$ = this.userSubject.asObservable();

  // ==============================
  // 🔥 LOGIN (NO CAMBIAR)
  // ==============================
  setFromAuth(user: any): void {

    const session: UserSession = {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.role ?? 'USER',
      mode: this.mapMode(user.role ?? 'USER')
    };

    this.save(session);
  }

  // ==============================
  // 🧠 UPDATE PARCIAL (NUEVO)
  // ==============================
  updatePartial(data: Partial<UserSession>): void {

    const current = this.userSubject.value;

    if (!current) return;

    const updated: UserSession = {
      ...current,
      ...data,

      // 🔥 CRÍTICO: mantener mode intacto
      mode: current.mode
    };

    this.save(updated);
  }

  // ==============================
  // 🧠 backend session (opcional)
  // ==============================
  getMe(): Observable<UserSession> {
    return this.http.get<UserSession>('/api/me').pipe(
      tap(session => this.save(session))
    );
  }

  // ==============================
  // ❌ logout
  // ==============================
  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.userSubject.next(null);
  }

  // ==============================
  // ⚡ SNAPSHOT
  // ==============================
  getSnapshot(): UserSession | null {
    return this.userSubject.value;
  }

  // ==============================
  // 💾 persistencia
  // ==============================
  private save(session: UserSession): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    this.userSubject.next(session);
  }

  private loadFromStorage(): UserSession | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  // ==============================
  // 🎯 MAPEO REAL
  // ==============================
  private mapMode(role: UserSession['role']): UserSession['mode'] {

    switch (role) {
      case 'OWNER':
        return 'OWNER';

      case 'ADMIN':
        return 'ADMIN';

      case 'USER':
        return 'USER_PERMISSION';

      default:
        return 'USER_PERMISSION';
    }
  }
}