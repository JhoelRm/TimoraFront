import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Configuration } from '../../models/configuration';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/configurations`;

  private configSubject = new BehaviorSubject<Configuration | null>(null);
  readonly config$ = this.configSubject.asObservable();

  refreshMy(): Observable<Configuration> {
    return this.http.get<Configuration>(this.api).pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  patch(partial: Partial<Configuration>): Observable<Configuration> {
    return this.http.patch<Configuration>(this.api, partial).pipe(
      tap(updated => {
        const current = this.configSubject.value;
        this.configSubject.next({ ...(current ?? ({} as Configuration)), ...updated });
      })
    );
  }

  setConfig(config: Configuration): void {
    this.configSubject.next(config);
  }

  getCurrentConfig(): Configuration | null {
    return this.configSubject.value;
  }

  clearCache(): void {
    this.configSubject.next(null);
  }
}