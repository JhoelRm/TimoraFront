// services/permissions/perimssions.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
    console.log(`🔍 [SERVICE] getByUserId: userId=${userId}`);
    return this.http.get<UserSupplierPermissionDTO[]>(
      `${this.baseUrl}/user/${userId}`
    ).pipe(
      tap({
        next: (data) => console.log(`✅ [SERVICE] getByUserId éxito:`, data),
        error: (err) => console.error(`❌ [SERVICE] getByUserId error:`, err)
      })
    );
  }

  getBySupplierId(supplierId: number): Observable<UserSupplierPermissionDTO[]> {
    console.log(`🔍 [SERVICE] getBySupplierId: supplierId=${supplierId}`);
    return this.http.get<UserSupplierPermissionDTO[]>(
      `${this.baseUrl}/supplier/${supplierId}`
    ).pipe(
      tap({
        next: (data) => console.log(`✅ [SERVICE] getBySupplierId éxito:`, data),
        error: (err) => console.error(`❌ [SERVICE] getBySupplierId error:`, err)
      })
    );
  }

  getPermissionMap(userId: number): Observable<UserPermissionMapResponse> {
    console.log(`🔍 [SERVICE] getPermissionMap: userId=${userId}`);
    console.log(`📡 [SERVICE] URL: ${this.baseUrl}/user/${userId}/map`);
    
    return this.http.get<UserPermissionMapDTO>(
      `${this.baseUrl}/user/${userId}/map`
    ).pipe(
      map(response => {
        console.log(`📦 [SERVICE] getPermissionMap - respuesta cruda:`, response);
        const permissions = response.permissions || {};
        console.log(`📦 [SERVICE] getPermissionMap - permissions extraídos:`, permissions);
        return permissions;
      }),
      tap({
        next: (data) => {
          console.log(`✅ [SERVICE] getPermissionMap éxito:`, data);
          console.log(`📊 [SERVICE] Cantidad de suppliers con permisos: ${Object.keys(data).length}`);
        },
        error: (err) => {
          console.error(`❌ [SERVICE] getPermissionMap error:`, err);
          console.error(`❌ [SERVICE] Detalles del error:`, {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error
          });
        }
      })
    );
  }

  create(dto: UserSupplierPermissionCreateDTO): Observable<UserSupplierPermissionDTO> {
    console.log(`➕ [SERVICE] CREATE PERMISSION`);
    console.log(`📦 [SERVICE] DTO:`, dto);
    console.log(`📡 [SERVICE] URL: ${this.baseUrl}`);
    console.log(`🔍 [SERVICE] Detalle DTO:`);
    console.log(`  - userId: ${dto.userId} (${typeof dto.userId})`);
    console.log(`  - supplierId: ${dto.supplierId} (${typeof dto.supplierId})`);
    console.log(`  - permission: ${dto.permission} (${typeof dto.permission})`);
    
    return this.http.post<UserSupplierPermissionDTO>(this.baseUrl, dto).pipe(
      tap({
        next: (data) => {
          console.log(`✅ [SERVICE] CREATE éxito:`, data);
        },
        error: (err) => {
          console.error(`❌ [SERVICE] CREATE error:`, err);
          console.error(`❌ [SERVICE] Detalles del error CREATE:`, {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error
          });
          if (err.error) {
            console.error(`📦 [SERVICE] Body del error:`, err.error);
          }
        }
      })
    );
  }

  delete(dto: UserSupplierPermissionCreateDTO): Observable<void> {
    console.log(`🗑️ [SERVICE] DELETE PERMISSION`);
    console.log(`📦 [SERVICE] DTO:`, dto);
    console.log(`🔍 [SERVICE] Detalle DTO:`);
    console.log(`  - userId: ${dto.userId} (${typeof dto.userId})`);
    console.log(`  - supplierId: ${dto.supplierId} (${typeof dto.supplierId})`);
    console.log(`  - permission: ${dto.permission} (${typeof dto.permission})`);
    
    const params = new HttpParams()
      .set('userId', dto.userId.toString())
      .set('supplierId', dto.supplierId.toString())
      .set('permission', dto.permission.toString());
    
    console.log(`📡 [SERVICE] URL: ${this.baseUrl}`);
    console.log(`📡 [SERVICE] Params:`, params.toString());
    
    return this.http.delete<void>(this.baseUrl, { params }).pipe(
      tap({
        next: (data) => {
          console.log(`✅ [SERVICE] DELETE éxito:`, data);
        },
        error: (err) => {
          console.error(`❌ [SERVICE] DELETE error:`, err);
          console.error(`❌ [SERVICE] Detalles del error DELETE:`, {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error
          });
          if (err.error) {
            console.error(`📦 [SERVICE] Body del error:`, err.error);
          }
        }
      })
    );
  }

  hasAnyPermission(userId: number): Observable<boolean> {
    console.log(`🔍 [SERVICE] hasAnyPermission: userId=${userId}`);
    return this.http.get<boolean>(
      `${this.baseUrl}/user/${userId}/has-any`
    ).pipe(
      tap({
        next: (data) => console.log(`✅ [SERVICE] hasAnyPermission éxito:`, data),
        error: (err) => console.error(`❌ [SERVICE] hasAnyPermission error:`, err)
      })
    );
  }

  getPermissionsArray(userId: number): Observable<Array<{ supplierId: number; permissions: Permission[] }>> {
    console.log(`🔍 [SERVICE] getPermissionsArray: userId=${userId}`);
    return this.getPermissionMap(userId).pipe(
      map((map: UserPermissionMapResponse) => {
        console.log(`📦 [SERVICE] getPermissionsArray - map recibido:`, map);
        const result = Object.keys(map).map(supplierId => ({
          supplierId: Number(supplierId),
          permissions: map[Number(supplierId)] || []
        }));
        console.log(`📦 [SERVICE] getPermissionsArray - resultado:`, result);
        return result;
      }),
      tap({
        next: (data) => console.log(`✅ [SERVICE] getPermissionsArray éxito: ${data.length} suppliers`),
        error: (err) => console.error(`❌ [SERVICE] getPermissionsArray error:`, err)
      })
    );
  }
}