export interface UserSession {
    firstName: string;
    lastName: string;
    role: 'OWNER' | 'ADMIN' | 'USER';
    mode: 'OWNER' | 'ADMIN' | 'ADMIN_SUPPLIER' | 'USER_PERMISSION' | 'USER_SUPPLIER' | 'USER_PERMISSION_SUPPLIER';
}