export interface User {
    userId: number;
    email: string;
    companyId: number;
    personId: number;
    role: 'OWNER' | 'ADMIN' | 'USER' | 'USER_SUPPLIER';
}