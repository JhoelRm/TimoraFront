
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Briefcase } from 'lucide-angular';
import { MyScheduleSupplier } from '../../../../models/my-schedule';
import { MyScheduleService } from '../../../../services/my-schedule/my-schedule';

@Component({
  selector: 'app-my-schedule-supplier-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './my-schedule-supplier-selector.html',
  styleUrls: ['./my-schedule-supplier-selector.scss']
})
export class MyScheduleSupplierSelectorComponent implements OnInit {
  @Input() suppliers: MyScheduleSupplier[] = [];
  @Input() selectedSupplierId: number | null = null;
  @Input() isLoading = false;
  @Input() error: string | null = null;
  
  @Output() supplierSelected = new EventEmitter<number>();
  @Output() retry = new EventEmitter<void>();

  icons = {
    User,
    Briefcase
  };

  private myScheduleService = inject(MyScheduleService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // No cargamos datos aquí, el padre lo maneja
  }

  selectSupplier(supplierId: number): void {
    this.supplierSelected.emit(supplierId);
  }

  onRetry(): void {
    this.retry.emit();
  }

  // Obtener iniciales para el avatar
  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}