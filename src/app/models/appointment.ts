export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'INACTIVE' | 'DELETED';
export type BookingType = 'APPOINTMENT' | 'RESERVATION';

export interface BookingDTO {
  id: number;
  companyId: number;
  serviceId: number;
  customerId: number;
  createdByUserId: number;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  type: BookingType;
  name: string;
  description: string;
  createdAt: string;
}

export interface BookingCreateDTO {
  companyId: number;
  serviceId: number;
  customerId: number;
  startTime: string;
  endTime: string;
  type?: BookingType;
  name?: string;
  description?: string;
}

export interface BookingPatchDTO {
  serviceId?: number;
  customerId?: number;
  startTime?: string;
  endTime?: string;
  status?: BookingStatus;
  type?: BookingType;
  name?: string;
  description?: string;
}

export interface BookingEvent {
  id: number;
  title: string;
  description: string;
  customerName: string;
  serviceName: string;
  start: Date;
  end: Date;
  status: BookingStatus;
  type: BookingType;
  color?: string;
}
