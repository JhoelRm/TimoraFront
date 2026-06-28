import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `<div [class]="classes"><ng-content></ng-content></div>`,
})
export class CardContentComponent {
  @Input() className = '';

  get classes(): string {
    return ['px-6 [&:last-child]:pb-6', this.className].join(' ');
  }
}