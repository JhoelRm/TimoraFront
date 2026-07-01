// models/permission.ts

// ============================================
// ENUM: Permission
// ============================================
export enum Permission {
  // Bookings
  BOOKING_CREATE = 'BOOKING_CREATE',
  BOOKING_READ = 'BOOKING_READ',
  BOOKING_UPDATE = 'BOOKING_UPDATE',
  BOOKING_DELETE = 'BOOKING_DELETE',

  // Abilities (Availability)
  ABILITY_CREATE = 'ABILITY_CREATE',
  ABILITY_READ = 'ABILITY_READ',
  ABILITY_UPDATE = 'ABILITY_UPDATE',
  ABILITY_DELETE = 'ABILITY_DELETE',

  // Services
  SERVICE_CREATE = 'SERVICE_CREATE',
  SERVICE_READ = 'SERVICE_READ',
  SERVICE_UPDATE = 'SERVICE_UPDATE',
  SERVICE_DELETE = 'SERVICE_DELETE',

  // Clients
  CLIENT_CREATE = 'CLIENT_CREATE',
  CLIENT_READ = 'CLIENT_READ',
  CLIENT_UPDATE = 'CLIENT_UPDATE',
  CLIENT_DELETE = 'CLIENT_DELETE'
}

// ============================================
// DTO: UserSupplierPermissionCreateDTO
// ============================================
export interface UserSupplierPermissionCreateDTO {
  userId: number;
  supplierId: number;
  permission: Permission;
}

// ============================================
// DTO: UserSupplierPermissionDTO
// ============================================
export interface UserSupplierPermissionDTO {
  userId: number;
  supplierId: number;
  permission: Permission;
  assignedByUserId: number | null;
  createdAt: string;
}

// ============================================
// DTO: UserPermissionMapDTO
// ============================================
export interface UserPermissionMapDTO {
  permissions: Record<number, Permission[]>;
}

export type UserPermissionMapResponse = Record<number, Permission[]>;

// ============================================
// HELPERS: Grupos de permisos (sin as const)
// ============================================
export const PermissionGroups = {
  BOOKINGS: [
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_DELETE
  ] as Permission[],
  AVAILABILITY: [
    Permission.ABILITY_CREATE,
    Permission.ABILITY_READ,
    Permission.ABILITY_UPDATE,
    Permission.ABILITY_DELETE
  ] as Permission[],
  SERVICES: [
    Permission.SERVICE_CREATE,
    Permission.SERVICE_READ,
    Permission.SERVICE_UPDATE,
    Permission.SERVICE_DELETE
  ] as Permission[],
  CLIENTS: [
    Permission.CLIENT_CREATE,
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_DELETE
  ] as Permission[]
};

// ============================================
// HELPERS: Labels para los grupos
// ============================================
export const PermissionGroupLabels = {
  BOOKINGS: 'Bookings',
  AVAILABILITY: 'Availability',
  SERVICES: 'Services',
  CLIENTS: 'Clients'
};

// ============================================
// HELPERS: Obtener grupos con labels
// ============================================
export const PermissionGroupsWithLabels = [
  {
    key: 'BOOKINGS' as const,
    label: PermissionGroupLabels.BOOKINGS,
    permissions: PermissionGroups.BOOKINGS
  },
  {
    key: 'AVAILABILITY' as const,
    label: PermissionGroupLabels.AVAILABILITY,
    permissions: PermissionGroups.AVAILABILITY
  },
  {
    key: 'SERVICES' as const,
    label: PermissionGroupLabels.SERVICES,
    permissions: PermissionGroups.SERVICES
  },
  {
    key: 'CLIENTS' as const,
    label: PermissionGroupLabels.CLIENTS,
    permissions: PermissionGroups.CLIENTS
  }
];

// ============================================
// HELPERS: Función para obtener label de un permiso
// ============================================
export function getPermissionLabel(permission: Permission): string {
  return permission
    .toLowerCase()
    .replace('_', ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
}

// ============================================
// HELPERS: Función para obtener grupo de un permiso
// ============================================
export function getPermissionGroup(permission: Permission): string | null {
  if (PermissionGroups.BOOKINGS.includes(permission)) return 'BOOKINGS';
  if (PermissionGroups.AVAILABILITY.includes(permission)) return 'AVAILABILITY';
  if (PermissionGroups.SERVICES.includes(permission)) return 'SERVICES';
  if (PermissionGroups.CLIENTS.includes(permission)) return 'CLIENTS';
  return null;
}

// ============================================
// HELPERS: Verificar si un permiso existe
// ============================================
export function isValidPermission(value: string): value is Permission {
  return Object.values(Permission).includes(value as Permission);
}

// ============================================
// HELPERS: Obtener todos los permisos como array
// ============================================
export const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

// ============================================
// HELPERS: Tipo para los grupos de permisos
// ============================================
export type PermissionGroupKey = keyof typeof PermissionGroups;

