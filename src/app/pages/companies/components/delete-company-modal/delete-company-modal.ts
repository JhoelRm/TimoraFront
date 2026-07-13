import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '../../../../components/modal/modal/modal';
import { CompanyDTO } from '../../../../models/company';


@Component({
  selector: 'app-delete-company-modal',
  standalone: true,
  imports: [
    ModalComponent
  ],
  templateUrl: './delete-company-modal.html',
  styleUrl: './delete-company-modal.scss'
})
export class DeleteCompanyModalComponent {

  @Input()
  open = false;


  @Input()
  company: CompanyDTO | null = null;


  @Output()
  close = new EventEmitter<void>();


  @Output()
  confirm = new EventEmitter<void>();

}