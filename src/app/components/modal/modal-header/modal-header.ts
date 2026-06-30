import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './modal-header.html',
})
export class ModalHeaderComponent {

  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  icons = { X };
}