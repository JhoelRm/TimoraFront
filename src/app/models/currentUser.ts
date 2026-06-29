export interface CurrentUser {
    userId: number;
    email: string;
    companyId: number;
    personId: number;
    role: 'OWNER' | 'ADMIN' | 'USER';
}