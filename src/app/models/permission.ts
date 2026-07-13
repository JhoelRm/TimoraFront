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

  // Availability (Availability)
  AVAILABILITY_CREATE = 'AVAILABILITY_CREATE',
  AVAILABILITY_READ = 'AVAILABILITY_READ',
  AVAILABILITY_UPDATE = 'AVAILABILITY_UPDATE',
  AVAILABILITY_DELETE = 'AVAILABILITY_DELETE',

  // Services
  SERVICE_CREATE = 'SERVICE_CREATE',
  SERVICE_READ = 'SERVICE_READ',
  SERVICE_UPDATE = 'SERVICE_UPDATE',
  SERVICE_DELETE = 'SERVICE_DELETE',

  // Clients
  CUSTOMER_CREATE = 'CUSTOMER_CREATE',
  CUSTOMER_READ = 'CUSTOMER_READ',
  CUSTOMER_UPDATE = 'CUSTOMER_UPDATE',
  CUSTOMER_DELETE = 'CUSTOMER_DELETE'
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
  AVAILABILITIES: [
    Permission.AVAILABILITY_CREATE,
    Permission.AVAILABILITY_READ,
    Permission.AVAILABILITY_UPDATE,
    Permission.AVAILABILITY_DELETE
  ] as Permission[],
  SERVICES: [
    Permission.SERVICE_CREATE,
    Permission.SERVICE_READ,
    Permission.SERVICE_UPDATE,
    Permission.SERVICE_DELETE
  ] as Permission[],
  CUSTOMERS: [
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_READ,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_DELETE
  ] as Permission[]
};

// ============================================
// HELPERS: Labels para los grupos
// ============================================
export const PermissionGroupLabels = {
  BOOKINGS: 'Bookings',
  AVAILABILITIES: 'Availabilities',
  SERVICES: 'Services',
  CUSTOMERS: 'Customers'
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
    key: 'AVAILABILITIES' as const,
    label: PermissionGroupLabels.AVAILABILITIES,
    permissions: PermissionGroups.AVAILABILITIES
  },
  {
    key: 'SERVICES' as const,
    label: PermissionGroupLabels.SERVICES,
    permissions: PermissionGroups.SERVICES
  },
  {
    key: 'CUSTOMERS' as const,
    label: PermissionGroupLabels.CUSTOMERS,
    permissions: PermissionGroups.CUSTOMERS
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
  if (PermissionGroups.AVAILABILITIES.includes(permission)) return 'AVAILABILITIES';
  if (PermissionGroups.SERVICES.includes(permission)) return 'SERVICES';
  if (PermissionGroups.CUSTOMERS.includes(permission)) return 'CUSTOMERS';
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

