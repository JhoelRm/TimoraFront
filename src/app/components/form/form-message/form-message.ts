import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-message.html',
})
export class FormMessageComponent {
  @Input() message: string | null = null;
}