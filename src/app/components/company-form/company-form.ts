import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyDTO, CompanyPatchDTO } from '../../models/company';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './company-form.html',
  styleUrl: './company-form.scss',
})
export class CompanyForm {

  @Input() company!: CompanyDTO;

  @Input() editForm!: CompanyPatchDTO;

  @Input() validationErrors!: { [key: string]: string };

  @Input() saving!: boolean;

  @Input() saveSuccess!: boolean;

  @Input() icons!: any;

  @Input() formValid!: boolean;

  @Output() save = new EventEmitter<void>();

}
