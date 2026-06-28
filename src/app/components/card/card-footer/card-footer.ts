import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `<div [class]="classes"><ng-content></ng-content></div>`,
})
export class CardFooterComponent {
  @Input() className = '';

  get classes(): string {
    return [
      'flex items-center px-6 pb-6',
      this.className,
    ].join(' ');
  }
}