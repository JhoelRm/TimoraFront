import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { BookingEvent } from '../../../../../../models/booking';

type CalendarViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-bookings-calendar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bookings-calendar.html',
  styleUrls: ['./bookings-calendar.scss'],
})
export class BookingsCalendar implements OnChanges {
  @Input() events: BookingEvent[] = [];
  @Input() currentDate: Date = new Date();
  @Input() selectedDate: Date = new Date();
  @Input() calendarViewMode: CalendarViewMode = 'week';
  @Input() loading = false;
  @Input() canEdit = false;   // ← NUEVO INPUT
  @Input() canDelete = false; // ← NUEVO INPUT

  @Output() today = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() viewModeChange = new EventEmitter<CalendarViewMode>();
  @Output() selectedDateChange = new EventEmitter<Date>();
  @Output() eventClick = new EventEmitter<BookingEvent>();

  icons = { ChevronLeft, ChevronRight };

  hours: number[] = [];
  weekDays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  monthDays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  hourHeight = 48;
  startHour = 6;
  endHour = 22;

  constructor() {
    this.generateHours();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambian los eventos o la fecha, no necesitamos hacer nada especial
  }

  private generateHours(): void {
    this.hours = [];
    for (let i = this.startHour; i <= this.endHour; i++) {
      this.hours.push(i);
    }
  }

  getDayLabel(date: Date): string {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  }

  getDateDisplay(): string {
    const date = this.currentDate;
    if (this.calendarViewMode === 'day') {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } else if (this.calendarViewMode === 'week') {
      const start = this.getWeekStart();
      const end = this.getWeekEnd();
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('es-ES', { month: 'long' })} ${start.getFullYear()}`;
      } else {
        return `${start.toLocaleDateString('es-ES', { month: 'short' })} – ${end.toLocaleDateString('es-ES', { month: 'short' })} ${end.getFullYear()}`;
      }
    } else {
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
  }

  getWeekStart(): Date {
    const date = new Date(this.currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date;
  }

  getWeekEnd(): Date {
    const date = this.getWeekStart();
    date.setDate(date.getDate() + 6);
    return date;
  }

  getWeekDays(): Date[] {
    const start = this.getWeekStart();
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }

  getMonthDays(): (Date | null)[][] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }

  getDayEvents(date: Date): BookingEvent[] {
    const dateStr = date.toDateString();
    return this.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === dateStr;
    });
  }

  getEventTop(event: BookingEvent): number {
    const start = new Date(event.start);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const top = (startHour - this.startHour) * this.hourHeight;
    return Math.max(top, 0);
  }

  getEventHeight(event: BookingEvent): number {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const height = (endHour - startHour) * this.hourHeight;
    return Math.max(height, 20);
  }

  getCurrentTimePosition(): number {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    const position = (hours - this.startHour) * this.hourHeight;
    return Math.max(position, 0);
  }

  formatEventTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelected(date: Date): boolean {
    return date.toDateString() === this.selectedDate.toDateString();
  }

  isSameMonth(date: Date | null): boolean {
    if (!date) return false;
    return date.getMonth() === this.currentDate.getMonth();
  }

  selectDay(date: Date): void {
    this.selectedDateChange.emit(date);
  }

  onEventClick(event: BookingEvent): void {
    // Solo emitir si tiene permisos de edición o eliminación
    if (this.canEdit || this.canDelete) {
      this.eventClick.emit(event);
    }
  }

  setView(mode: CalendarViewMode): void {
    this.viewModeChange.emit(mode);
  }

  onToday(): void {
    this.today.emit();
  }

  onPrevious(): void {
    this.previous.emit();
  }

  onNext(): void {
    this.next.emit();
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByEventId(index: number, event: BookingEvent): number {
    return event.id;
  }

  trackByMonthIndex(index: number, date: Date | null): string {
    return date ? date.toDateString() : `empty-${index}`;
  }
}