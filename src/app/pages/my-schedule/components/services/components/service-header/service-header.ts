// my-schedule/components/services/components/service-header/service-header.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-service-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './service-header.html',
  styleUrls: ['./service-header.scss']
})
export class ServiceHeader {
  @Input() servicesCount = 0;
  @Input() canCreate = false;
  @Input() isLoading = false;

  @Output() createService = new EventEmitter<void>();

  icons = { Plus };

  onCreate(): void {
    this.createService.emit();
  }
}