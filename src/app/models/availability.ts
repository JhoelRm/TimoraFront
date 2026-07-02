// models/availability.ts
export type AvailabilityStatus = 'ACTIVE' | 'INACTIVE';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export interface AvailabilityDTO {
  id: number;
  companyId: number;
  supplierId: number;
  supplierName: string;
  startDate: string; // LocalDate
  endDate: string; // LocalDate
  dayOfWeek: DayOfWeek;
  startTime: string; // LocalTime
  endTime: string; // LocalTime
  slotDurationMinutes: number; // minutos
  capacity: number;
  recurrenceType: RecurrenceType;
  status: AvailabilityStatus;
  notes: string;
}

export interface AvailabilityCreateDTO {
  companyId: number;
  supplierId: number;
  startDate: string;
  endDate: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  capacity: number;
  recurrenceType: RecurrenceType;
  notes: string;
}

export interface AvailabilityPatchDTO {
  startDate?: string;
  endDate?: string;
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  capacity?: number;
  recurrenceType?: RecurrenceType;
  status?: AvailabilityStatus;
  notes?: string;
}

export interface AvailabilityEvent {
  id: number;
  supplierId: number;
  supplierName: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}