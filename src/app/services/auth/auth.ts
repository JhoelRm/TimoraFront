import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CurrentUser } from '../../models/currentUser';
import { SessionService } from '../user-session/user-session';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: CurrentUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = '/auth/login';

  constructor(
    private http: HttpClient,
    private session: SessionService
  ) {}

  // 🔐 LOGIN
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.api, { email, password }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  // 🧠 GUARDAR SESIÓN (SYNC TOTAL)
  private saveSession(res: LoginResponse): void {
    if (!res?.accessToken || !res?.user) return;

    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('user', JSON.stringify(res.user));

    this.session.setFromAuth(res.user);
  }

  // 🔑 TOKEN
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 👤 USER
  getUser(): CurrentUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      this.logout();
      return null;
    }
  }

  // 🚪 LOGOUT LIMPIO
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session');

    this.session.clear();
  }

  // ✔ CHECK LOGIN
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}