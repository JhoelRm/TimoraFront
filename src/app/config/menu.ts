export type Role = 'OWNER' | 'ADMIN' | 'USER';

export type UiMode =
  | 'OWNER'
  | 'ADMIN'
  | 'USER'
  | 'ADMIN_SUPPLIER'
  | 'USER_SUPPLIER'
  | 'USER_PERMISSION'
  | 'USER_PERMISSION_SUPPLIER';

import { LucideIconData } from 'lucide-angular';

export interface MenuItem {
  label: string;
  route: string;
  icon?: LucideIconData;
  modes?: UiMode[];
}

import { Briefcase,
LayoutDashboard,
Building2,
CalendarDays,
Clock,
Package,
Users,
UserCheck,
CreditCard,
User,
Settings,
LogOut,
Shield, } from 'lucide-angular';

export const MENU: MenuItem[] = [
  {
    label: 'Dashboard',
    route: '/app/dashboard',
    icon: LayoutDashboard,
    modes: [
      'OWNER',
      'ADMIN',
      'USER',
      'ADMIN_SUPPLIER',
      'USER_SUPPLIER',
      'USER_PERMISSION',
      'USER_PERMISSION_SUPPLIER',
    ],
  },

  {
    label: 'Companies',
    route: '/app/companies',
    icon: Building2,
    modes: ['OWNER'],
  },

  {
    label: 'Company',
    route: '/app/company',
    icon: Building2,
    modes: ['ADMIN', 'ADMIN_SUPPLIER'],
  },

  {
    label: 'My Schedule',
    route: '/app/my-schedule',
    icon: Shield,
    modes: ['USER_PERMISSION', 'USER_PERMISSION_SUPPLIER'],
  },

  {
    label: 'Bookings',
    route: '/app/bookings',
    icon: CalendarDays,
    modes: [
      'OWNER',
      'ADMIN',
      'ADMIN_SUPPLIER',
      'USER_SUPPLIER',
      'USER_PERMISSION_SUPPLIER',
    ],
  },

  {
    label: 'Availabilities',
    route: '/app/availabilities',
    icon: Clock,
    modes: [
      'OWNER',
      'ADMIN',
      'ADMIN_SUPPLIER',
      'USER_SUPPLIER',
      'USER_PERMISSION_SUPPLIER',
    ],
  },

  {
    label: 'Services',
    route: '/app/services',
    icon: Package,
    modes: [
      'OWNER',
      'ADMIN',
      'ADMIN_SUPPLIER',
      'USER_SUPPLIER',
      'USER_PERMISSION_SUPPLIER',
    ],
  },

  {
    label: 'Users',
    route: '/app/users',
    icon: Users,
    modes: ['OWNER', 'ADMIN', 'ADMIN_SUPPLIER'],
  },

  {
    label: 'Customers',
    route: '/app/customers',
    icon: UserCheck,
    modes: [
      'OWNER',
      'ADMIN',
      'ADMIN_SUPPLIER',
      'USER',
      'USER_SUPPLIER',
      'USER_PERMISSION',
      'USER_PERMISSION_SUPPLIER',
    ],
  },

  {
    label: 'Payments',
    route: '/app/payments',
    icon: CreditCard,
    modes: [
      'OWNER',
      'ADMIN',
      'ADMIN_SUPPLIER',
      'USER',
      'USER_SUPPLIER',
      'USER_PERMISSION',
      'USER_PERMISSION_SUPPLIER',
    ],
  },

  {
    label: 'Profile',
    route: '/app/profile',
    icon: User,
    modes: [
      'OWNER',
      'ADMIN',
      'ADMIN_SUPPLIER',
      'USER',
      'USER_SUPPLIER',
      'USER_PERMISSION',
      'USER_PERMISSION_SUPPLIER',
    ],
  },

  {
    label: 'Settings',
    route: '/app/settings',
    icon: Settings,
    modes: [
      'OWNER',
      'ADMIN',
      'ADMIN_SUPPLIER',
      'USER',
      'USER_SUPPLIER',
      'USER_PERMISSION',
      'USER_PERMISSION_SUPPLIER',
    ],
  },
];