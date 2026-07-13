// models/my-schedule.ts
import { PersonDTO } from './person-identity';
import { Permission } from './permission';

export interface MyScheduleSupplier {
  supplierId: number;
  person: PersonDTO;
  specialty: string;
  permissions: Permission[];
  hasAnyPermission: boolean;
}

export interface MyScheduleState {
  selectedSupplierId: number | null;
  activeTab: 'BOOKINGS' | 'AVAILABILITY' | 'SERVICES';
  suppliers: MyScheduleSupplier[];
}