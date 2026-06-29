import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { SessionService } from '../services/user-session/user-session';
import { ROUTE_PERMISSIONS } from '../config/route-permissions';

export const permissionGuard: CanActivateChildFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const session = sessionService.getSnapshot();

  // ❌ sin sesión → bloquear acceso
  if (!session) {
    return router.createUrlTree(['/login']);
  }

  const url = state.url.split('?')[0].split(';')[0];
  const allowed = ROUTE_PERMISSIONS[url];

  // ✔ si no hay restricción explícita → permitir
  if (!allowed) {
    return true;
  }

  // ✔ si tiene permiso → permitir
  if (allowed.includes(session.mode)) {
    return true;
  }

  // ❌ sin permiso → redirigir
  return router.createUrlTree(['/app/dashboard']);
};