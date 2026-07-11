import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '../modal/modal/modal';
import { CompaniesFormComponent } from '../companies-form/companies-form';
import { CompanyPatchDTO } from '../../models/company';


@Component({
  selector: 'app-edit-company-modal',
  standalone: true,
  imports: [
    ModalComponent,
    CompaniesFormComponent
  ],
  templateUrl: './edit-company-modal.html',
  styleUrl: './edit-company-modal.scss'
})
export class EditCompanyModalComponent {

  @Input()
  open = false;


  @Input({ required: true })
  model!: CompanyPatchDTO;


  @Output()
  close = new EventEmitter<void>();


  @Output()
  save = new EventEmitter<void>();

}