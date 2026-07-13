import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Search } from 'lucide-angular';

@Component({
  selector: 'app-companies-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './companies-header.html',
  styleUrl: './companies-header.scss'
})
export class CompaniesHeaderComponent {

  @Input() search = '';

  @Input() totalCompanies = 0;

  @Output() searchChange = new EventEmitter<string>();

  @Output() create = new EventEmitter<void>();

  icons = {
    Search,
    Plus
  };

}