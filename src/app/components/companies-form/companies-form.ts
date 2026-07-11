import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CompanyCreateDTO,
  CompanyPatchDTO
} from '../../models/company';

@Component({
  selector: 'app-companies-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './companies-form.html',
  styleUrl: './companies-form.scss'
})
export class CompaniesFormComponent {

  @Input({ required: true })
  model!: CompanyCreateDTO | CompanyPatchDTO;
}
