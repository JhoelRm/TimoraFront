import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Building2, Mail, MapPin, Pencil, Phone, Trash2 } from 'lucide-angular';
import { CompanyDTO } from '../../models/company';


@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './company-card.html',
  styleUrl: './company-card.scss'
})
export class CompanyCardComponent {

  @Input({ required: true })
  company!: CompanyDTO;

  @Output()
  edit = new EventEmitter<CompanyDTO>();

  @Output()
  delete = new EventEmitter<CompanyDTO>();

  icons = {
    Building2,
    MapPin,
    Phone,
    Mail,
    Pencil,
    Trash2
  };

  onEdit(): void {
    this.edit.emit(this.company);
  }

  onDelete(): void {
    this.delete.emit(this.company);
  }

}