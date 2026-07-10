import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { AvailabilityEvent } from '../../../../models/availability';

type CalendarViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-availabilities-calendar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './availabilities-calendar.html',
  styleUrls: ['./availabilities-calendar.scss'],
})
export class AvailabilitiesCalendar {
  @Input() events: AvailabilityEvent[] = [];
  @Input() currentDate: Date = new Date();
  @Input() selectedDate: Date = new Date();
  @Input() calendarViewMode: CalendarViewMode = 'week';

  @Output() selectedDateChange = new EventEmitter<Date>();
  @Output() viewModeChange = new EventEmitter<CalendarViewMode>();
  @Output() today = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  icons = { ChevronLeft, ChevronRight };

  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  hours: number[] = Array.from({ length: 17 }, (_, i) => i + 6);

  setView(mode: CalendarViewMode): void {
    this.viewModeChange.emit(mode);
  }

  onToday(): void { this.today.emit(); }
  onPrevious(): void { this.previous.emit(); }
  onNext(): void { this.next.emit(); }

  selectDay(date: Date): void {
    this.selectedDate = date;
    this.selectedDateChange.emit(date);
  }

  getDateDisplay(): string {
    var d = this.currentDate;
    if (this.calendarViewMode === 'week') {
      var start = new Date(d);
      start.setDate(d.getDate() - d.getDay() + 1);
      var end = new Date(start);
      end.setDate(start.getDate() + 6);
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' – ' + end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getWeekDays(): Date[] {
    var start = new Date(this.currentDate);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    start.setDate(start.getDate() + 1);
    var arr = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }
    return arr;
  }

  getMonthDays(): (Date | null)[][] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    // Convert Sunday=0 to Monday=0 index
    const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }

  getDayEvents(date: Date): AvailabilityEvent[] {
    if (!date) return [];
    var dateStr = date.toDateString();
    return this.events.filter(function(e) {
      return new Date(e.start).toDateString() === dateStr;
    });
  }

  getEventTop(event: AvailabilityEvent): number {
    var h = new Date(event.start).getHours() + new Date(event.start).getMinutes() / 60;
    return (h - 6) * 60;
  }

  getEventHeight(event: AvailabilityEvent): number {
    var sh = new Date(event.start).getHours() + new Date(event.start).getMinutes() / 60;
    var eh = new Date(event.end).getHours() + new Date(event.end).getMinutes() / 60;
    return Math.max((eh - sh) * 60, 30);
  }

  getCurrentTimePosition(): number {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    return (hours - 6) * 60;
  }

  isToday(date: Date): boolean {
    return date && date.toDateString() === new Date().toDateString();
  }

  isSelected(date: Date): boolean {
    return date && date.toDateString() === this.selectedDate.toDateString();
  }

  getHourLabel(hour: number): string {
    if (hour === 0) return '12a';
    if (hour < 12) return hour + 'a';
    if (hour === 12) return '12p';
    return (hour - 12) + 'p';
  }

  getDayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  formatEventTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  trackByEventId(_: number, item: AvailabilityEvent): number {
    return item.id;
  }

  trackByIndex(i: number): number {
    return i;
  }

  trackByMonthIndex(i: number): number {
    return i;
  }
}
