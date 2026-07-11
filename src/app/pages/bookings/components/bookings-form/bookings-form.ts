import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PersonIdentityDTO } from '../../../../models/person-identity';
import { ServiceDTO } from '../../../../models/service';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-bookings-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './bookings-form.html',
  styleUrls: ['./bookings-form.scss']
})
export class BookingsForm {
  @Input() formData: any = {};
  @Input() mode: FormMode = 'create';
  @Input() suppliers: PersonIdentityDTO[] = [];
  @Input() customers: PersonIdentityDTO[] = [];
  @Input() services: ServiceDTO[] = [];
  @Input() isUser = false;
  @Input() companies: { id: number; name: string }[] = [];

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getCompanyName(companyId: number): string {
    const company = this.companies.find(c => c.id === companyId);
    return company?.name || 'Unknown';
  }

  getCustomerName(customer: PersonIdentityDTO): string {
    return `${customer.person.firstName} ${customer.person.lastName}`;
  }

  getServiceLabel(service: ServiceDTO): string {
    return `${service.name} (${service.duration}min - $${service.price})`;
  }
}
