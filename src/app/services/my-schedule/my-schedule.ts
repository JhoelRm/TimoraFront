// services/my-schedule/my-schedule.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs'; 
import { PersonService } from '../person-identity/person-identity';
import { PermissionService } from '../permissions/perimssions';
import { AuthService } from '../auth/auth';
import { MyScheduleSupplier } from '../../models/my-schedule';
import { Permission } from '../../models/permission';

@Injectable({ providedIn: 'root' })
export class MyScheduleService {
    private http = inject(HttpClient);
    private personService = inject(PersonService);
    private permissionService = inject(PermissionService);
    private authService = inject(AuthService);

    /**
     * Obtiene todos los suppliers a los que el usuario actual tiene permisos
     */
    // my-schedule/my-schedule.service.ts
    getMySuppliers(): Observable<MyScheduleSupplier[]> {
        const currentUser = this.authService.getUser();
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        // ✅ Usar el userId del usuario actual (que es USER)
        const userId = currentUser.userId;
        console.log('🔍 Getting suppliers for user:', userId);

        // 1. Obtener el mapa de permisos del usuario
        return this.permissionService.getPermissionMap(userId).pipe(
            switchMap((permissionMap) => {
                console.log('📦 Permission map:', permissionMap);
                const supplierIds = Object.keys(permissionMap).map(Number);

                if (supplierIds.length === 0) {
                    console.log('ℹ️ No suppliers found');
                    return of([]); // ← IMPORTANTE: return of([]) en lugar de []
                }

                // 2. Obtener todos los person para obtener los detalles de los suppliers
                return this.personService.getAll().pipe(
                    map((allUsers) => {
                        const suppliers: MyScheduleSupplier[] = [];

                        for (const supplierId of supplierIds) {
                            const userWithSupplier = allUsers.find(
                                u => u.supplier && u.supplier.id === supplierId
                            );

                            if (userWithSupplier && userWithSupplier.supplier) {
                                suppliers.push({
                                    supplierId: supplierId,
                                    person: userWithSupplier.person,
                                    specialty: userWithSupplier.supplier.specialty || 'Supplier',
                                    permissions: permissionMap[supplierId] || [],
                                    hasAnyPermission: true
                                });
                            }
                        }

                        console.log('✅ Suppliers encontrados:', suppliers);
                        return suppliers;
                    })
                );
            })
        );
    }

    /**
     * Obtiene los permisos para un supplier específico
     */
    getSupplierPermissions(supplierId: number): Observable<Permission[]> {
        const currentUser = this.authService.getUser();
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        return this.permissionService.getPermissionMap(currentUser.userId).pipe(
            map((permissionMap) => {
                return permissionMap[supplierId] || [];
            })
        );
    }

    /**
     * Verifica si el usuario tiene un permiso específico para un supplier
     */
    hasPermission(supplierId: number, permission: Permission): Observable<boolean> {
        return this.getSupplierPermissions(supplierId).pipe(
            map((permissions) => permissions.includes(permission))
        );
    }
}