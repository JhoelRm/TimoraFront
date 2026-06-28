export type Role = 'OWNER' | 'ADMIN' | 'USER' | 'USER_SUPPLIER';

export interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  roles: Role[];
}

export const MENU: MenuItem[] = [
  {
    label: 'Dashboard',
    route: '/app/dashboard',
    roles: ['OWNER', 'ADMIN', 'USER', 'USER_SUPPLIER'],
  },
  {
    label: 'Companies',
    route: '/app/companies',
    roles: ['OWNER'],
  },
  {
    label: 'Users',
    route: '/app/users',
    roles: ['OWNER', 'ADMIN'],
  },
  {
    label: 'Bookings',
    route: '/app/bookings',
    roles: ['OWNER', 'ADMIN', 'USER_SUPPLIER'],
  },
];