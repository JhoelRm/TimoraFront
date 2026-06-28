import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `<h4 [class]="classes"><ng-content></ng-content></h4>`,
})
export class CardTitleComponent {
  @Input() className = '';

  get classes(): string {
    return ['leading-none', this.className].join(' ');
  }
}