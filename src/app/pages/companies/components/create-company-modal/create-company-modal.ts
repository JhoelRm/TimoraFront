import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ModalComponent } from '../../../../components/modal/modal/modal';
import { CompaniesFormComponent } from '../companies-form/companies-form';

import { CompanyCreateDTO } from '../../../../models/company';


@Component({
  selector: 'app-create-company-modal',
  standalone: true,
  imports: [
    ModalComponent,
    CompaniesFormComponent
  ],
  templateUrl: './create-company-modal.html',
  styleUrl: './create-company-modal.scss'
})
export class CreateCompanyModalComponent {


  @Input()
  open = false;


  @Input({ required:true })
  model!: CompanyCreateDTO;


  @Output()
  close = new EventEmitter<void>();


  @Output()
  save = new EventEmitter<void>();

}