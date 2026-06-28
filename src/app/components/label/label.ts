import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './label.html',
})
export class LabelComponent {
  @Input() className = '';
  @Input() for = '';

  get classes(): string {
    return [
      'flex items-center gap-2 text-sm leading-none font-medium select-none',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
      this.className,
    ].join(' ');
  }
}