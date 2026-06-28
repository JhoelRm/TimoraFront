import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `<div [class]="classes"><ng-content></ng-content></div>`,
})
export class CardHeaderComponent {
  @Input() className = '';

  get classes(): string {
    return [
      'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6',
      this.className,
    ].join(' ');
  }
}