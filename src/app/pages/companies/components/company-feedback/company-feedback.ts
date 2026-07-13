import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { CompanyDTO } from '../../../../models/company';

@Component({
  selector: 'app-company-feedback',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './company-feedback.html',
  styleUrl: './company-feedback.scss',
})
export class CompanyFeedback {

  @Input() loading!: boolean;

  @Input() error!: string | null;

  @Input() company!: CompanyDTO | null;

  @Input() icons!: any;

  @Output() retry = new EventEmitter<void>();

}
