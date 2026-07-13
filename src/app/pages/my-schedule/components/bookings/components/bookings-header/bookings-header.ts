// my-schedule/components/bookings/components/bookings-header/bookings-header.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Calendar, List } from 'lucide-angular';

type ViewMode = 'list' | 'calendar';

@Component({
  selector: 'app-bookings-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './bookings-header.html',
  styleUrls: ['./bookings-header.scss']
})
export class BookingsHeader {
  @Input() totalBookings = 0;
  @Input() viewMode: ViewMode = 'list';
  @Input() canCreate = false;
  @Input() isLoading = false;

  @Output() viewModeChange = new EventEmitter<ViewMode>();
  @Output() addClick = new EventEmitter<void>();

  icons = { Plus, Calendar, List };

  setView(mode: ViewMode): void {
    this.viewModeChange.emit(mode);
  }

  onAddClick(): void {
    this.addClick.emit();
  }
}