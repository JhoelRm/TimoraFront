import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `<p [class]="classes"><ng-content></ng-content></p>`,
})
export class CardDescriptionComponent {
  @Input() className = '';

  get classes(): string {
    return ['text-muted-foreground', this.className].join(' ');
  }
}