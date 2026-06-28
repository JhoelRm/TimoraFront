import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `<div [class]="classes"><ng-content></ng-content></div>`,
})
export class CardComponent {
  @Input() className = '';

  get classes(): string {
    return [
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border',
      this.className,
    ].join(' ');
  }
}