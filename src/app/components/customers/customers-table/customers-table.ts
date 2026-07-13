import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';

import { PersonIdentityDTO } from '../../../models/person-identity';

@Component({
  selector: 'app-customers-table',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './customers-table.html',
  styleUrl: './customers-table.scss',
})
export class CustomersTable {

  @Input() customers: PersonIdentityDTO[] = [];

  @Output() editCustomer = new EventEmitter<PersonIdentityDTO>();
  @Output() deleteCustomer = new EventEmitter<PersonIdentityDTO>();

  icons = {
    Pencil,
    Trash2
  };

  onEdit(customer: PersonIdentityDTO){
    this.editCustomer.emit(customer);
  }

  onDelete(customer: PersonIdentityDTO){
    this.deleteCustomer.emit(customer);
  }

}