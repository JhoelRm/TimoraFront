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

export type MenuItem =
  | {
      type: 'item';
      label: string;
      route: string;
      icon?: LucideIconData;
      modes?: UiMode[];
    }
  | {
      type: 'divider';
      label?: string;
      modes?: UiMode[];
    };

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
Shield, } from 'lucide-angular';

export const MENU: MenuItem[] = [
  {
    type: 'item',
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
    type: 'item',
    label: 'Companies',
    route: '/app/companies',
    icon: Building2,
    modes: ['OWNER'],
  },

  {
    type: 'item',
    label: 'Company',
    route: '/app/company',
    icon: Building2,
    modes: ['ADMIN', 'ADMIN_SUPPLIER'],
  },

  {
    type: 'item',
    label: 'My Schedule',
    route: '/app/my-schedule',
    icon: Shield,
    modes: ['USER_PERMISSION', 'USER_PERMISSION_SUPPLIER'],
  },

  {
    type: 'item',
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
    type: 'item',
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
    type: 'item',
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
    type: 'item',
    label: 'Users',
    route: '/app/users',
    icon: Users,
    modes: ['OWNER', 'ADMIN', 'ADMIN_SUPPLIER'],
  },

  {
    type: 'item',
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
    type: 'item',
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
    
    type: 'divider',
    label: '',
  },

  {
    type: 'item',
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
    type: 'item',
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