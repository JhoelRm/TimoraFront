// services/permissions/perimssions.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  UserSupplierPermissionCreateDTO,
  UserSupplierPermissionDTO,
  UserPermissionMapDTO,
  UserPermissionMapResponse,
  Permission
} from '../../models/permission';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private http = inject(HttpClient);
  private baseUrl = '/api/user-supplier-permissions';

  getByUserId(userId: number): Observable<UserSupplierPermissionDTO[]> {
    return this.http.get<UserSupplierPermissionDTO[]>(
      `${this.baseUrl}/user/${userId}`
    );
  }

  getBySupplierId(supplierId: number): Observable<UserSupplierPermissionDTO[]> {
    return this.http.get<UserSupplierPermissionDTO[]>(
      `${this.baseUrl}/supplier/${supplierId}`
    );
  }

  getPermissionMap(userId: number): Observable<UserPermissionMapResponse> {
    return this.http.get<UserPermissionMapDTO>(
      `${this.baseUrl}/user/${userId}/map`
    ).pipe(
      map(response => response.permissions || {})
    );
  }

  create(dto: UserSupplierPermissionCreateDTO): Observable<UserSupplierPermissionDTO> {
    return this.http.post<UserSupplierPermissionDTO>(this.baseUrl, dto);
  }

  delete(dto: UserSupplierPermissionCreateDTO): Observable<void> {
    return this.http.delete<void>(this.baseUrl, {
      params: {
        userId: dto.userId.toString(),
        supplierId: dto.supplierId.toString(),
        permission: dto.permission.toString()
      }
    });
  }

  hasAnyPermission(userId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/user/${userId}/has-any`
    );
  }

  getPermissionsArray(userId: number): Observable<Array<{ supplierId: number; permissions: Permission[] }>> {
    return this.getPermissionMap(userId).pipe(
      map((map: UserPermissionMapResponse) => {
        return Object.keys(map).map(supplierId => ({
          supplierId: Number(supplierId),
          permissions: map[Number(supplierId)] || []
        }));
      })
    );
  }
}