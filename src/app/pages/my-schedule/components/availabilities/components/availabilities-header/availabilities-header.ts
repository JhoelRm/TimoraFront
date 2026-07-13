// my-schedule/components/availability/components/availability-header/availability-header.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Calendar, List } from 'lucide-angular';

type ViewMode = 'list' | 'calendar';

@Component({
  selector: 'app-availability-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './availabilities-header.html',
  styleUrls: ['./availabilities-header.scss']
})
export class AvailabilitiesHeader {
  @Input() totalSchedules = 0;
  @Input() viewMode: ViewMode = 'calendar';
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