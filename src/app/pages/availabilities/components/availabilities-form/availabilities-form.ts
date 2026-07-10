import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PersonIdentityDTO } from '../../../../models/person-identity';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-availabilities-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './availabilities-form.html',
  styleUrls: ['./availabilities-form.scss']
})
export class AvailabilitiesForm {
  @Input() formData: any = {};
  @Input() mode: FormMode = 'create';
  @Input() suppliers: PersonIdentityDTO[] = [];
  @Input() isUser = false;
  @Input() companies: { id: number; name: string }[] = [];

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isDaySelected(day: string): boolean {
    return this.formData.dayOfWeek === day;
  }

  selectDayOfWeek(day: string): void {
    this.formData.dayOfWeek = day;
  }

  getDayOptions(): string[] {
    return ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  }

  getDayLabel(day: string): string {
    const map: Record<string, string> = {
      'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed',
      'THURSDAY': 'Thu', 'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
    };
    return map[day] || day;
  }

  getCompanyName(companyId: number): string {
    const company = this.companies.find(c => c.id === companyId);
    return company?.name || 'Unknown';
  }

  onSupplierChange(): void {
    const supplierId = this.formData.supplierId;
    if (supplierId) {
      const supplier = this.suppliers.find(s => s.supplier?.id === Number(supplierId));
      if (supplier) {
        this.formData.companyId = supplier.person.companyId;
      }
    }
  }
}
