import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { CurrentUser } from '../../models/currentUser';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: CurrentUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = '/auth/login';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(this.api, { email, password })
      .pipe(
        tap(res => {
          this.saveSession(res);
        })
      );
  }

  private saveSession(res: LoginResponse) {
    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): CurrentUser | null {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      this.logout();
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}