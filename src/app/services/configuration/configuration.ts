import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Configuration } from '../../models/configuration';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {

  private http = inject(HttpClient);
  private readonly api = '/api/configurations';

  // =========================
  // STATE CENTRAL (SOURCE OF TRUTH)
  // =========================
  private configSubject = new BehaviorSubject<Configuration | null>(null);

  readonly config$ = this.configSubject.asObservable();

  // =========================
  // GET INITIAL / REFRESH
  // =========================
  refreshMy(): Observable<Configuration> {
    return this.http.get<Configuration>(this.api).pipe(
      tap(config => {
        this.configSubject.next(config);
      })
    );
  }

  // =========================
  // PATCH (SYNC BACKEND + STATE)
  // =========================
  patch(partial: Partial<Configuration>): Observable<Configuration> {
    return this.http.patch<Configuration>(this.api, partial).pipe(
      tap(updated => {
        const current = this.configSubject.value;

        this.configSubject.next({
          ...(current ?? ({} as Configuration)),
          ...updated
        });
      })
    );
  }

  // =========================
  // MANUAL UPDATE
  // =========================
  setConfig(config: Configuration): void {
    this.configSubject.next(config);
  }

  // =========================
  // GET CURRENT VALUE
  // =========================
  getCurrentConfig(): Configuration | null {
    return this.configSubject.value;
  }

  // =========================
  // CLEAR
  // =========================
  clearCache(): void {
    this.configSubject.next(null);
  }
}