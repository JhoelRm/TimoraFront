// models/availability.ts

export type AvailabilityStatus = 'ACTIVE' | 'INACTIVE';
export type AvailabilityRecurring = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

// ==================== DTOs ====================

export interface AvailabilityDTO {
  id: number;
  companyId: number;
  supplierId: number;
  supplierName?: string; // Opcional, se puede agregar en frontend
  startDate: string; // LocalDate (YYYY-MM-DD)
  endDate: string; // LocalDate (YYYY-MM-DD)
  startTime: string; // LocalTime (HH:MM:SS)
  endTime: string; // LocalTime (HH:MM:SS)
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  recurrenceType: AvailabilityRecurring;
  slotDurationMinutes: number;
  capacity: number;
  status: AvailabilityStatus;
  notes: string;
  createdAt: string; // LocalDateTime
}

export interface AvailabilityCreateDTO {
  companyId: number;
  supplierId: number;
  startDate: string; // LocalDate (YYYY-MM-DD)
  endDate: string; // LocalDate (YYYY-MM-DD)
  startTime: string; // LocalTime (HH:MM:SS)
  endTime: string; // LocalTime (HH:MM:SS)
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  recurrenceType: AvailabilityRecurring;
  slotDurationMinutes: number;
  capacity: number;
  notes: string;
}

export interface AvailabilityPatchDTO {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  recurrenceType?: AvailabilityRecurring;
  slotDurationMinutes?: number;
  capacity?: number;
  status?: AvailabilityStatus;
  notes?: string;
}

// ==================== EVENTOS PARA CALENDARIO ====================

export interface AvailabilityEvent {
  id: number;
  supplierId: number;
  supplierName: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

// ==================== UTILITY FUNCTIONS ====================

// Función para obtener los días de la semana como string abreviado
export function getDaysString(availability: AvailabilityDTO): string {
  const days: string[] = [];
  const dayMap: Record<string, string> = {
    monday: 'MON',
    tuesday: 'TUE',
    wednesday: 'WED',
    thursday: 'THU',
    friday: 'FRI',
    saturday: 'SAT',
    sunday: 'SUN'
  };

  if (availability.monday) days.push(dayMap['monday']);
  if (availability.tuesday) days.push(dayMap['tuesday']);
  if (availability.wednesday) days.push(dayMap['wednesday']);
  if (availability.thursday) days.push(dayMap['thursday']);
  if (availability.friday) days.push(dayMap['friday']);
  if (availability.saturday) days.push(dayMap['saturday']);
  if (availability.sunday) days.push(dayMap['sunday']);

  return days.length > 0 ? days.join(', ') : 'N/A';
}

// Función para obtener el primer día de la semana (para mostrar en la lista)
export function getFirstDayOfWeek(availability: AvailabilityDTO): string {
  const dayMap: Record<string, string> = {
    monday: 'MON',
    tuesday: 'TUE',
    wednesday: 'WED',
    thursday: 'THU',
    friday: 'FRI',
    saturday: 'SAT',
    sunday: 'SUN'
  };

  if (availability.monday) return dayMap['monday'];
  if (availability.tuesday) return dayMap['tuesday'];
  if (availability.wednesday) return dayMap['wednesday'];
  if (availability.thursday) return dayMap['thursday'];
  if (availability.friday) return dayMap['friday'];
  if (availability.saturday) return dayMap['saturday'];
  if (availability.sunday) return dayMap['sunday'];
  return 'N/A';
}

// Función para crear un AvailabilityEvent desde AvailabilityDTO
export function toAvailabilityEvent(
  availability: AvailabilityDTO,
  supplierName?: string
): AvailabilityEvent {
  const start = new Date(availability.startDate);
  const end = new Date(availability.endDate);
  
  const [startHour, startMinute] = availability.startTime.split(':').map(Number);
  const [endHour, endMinute] = availability.endTime.split(':').map(Number);
  
  const startDate = new Date(start);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(endHour, endMinute, 0, 0);

  const name = supplierName || `Supplier ${availability.supplierId}`;

  return {
    id: availability.id,
    supplierId: availability.supplierId,
    supplierName: name,
    title: `${name} - Available`,
    start: startDate,
    end: endDate,
    color: '#7C6EF5'
  };
}