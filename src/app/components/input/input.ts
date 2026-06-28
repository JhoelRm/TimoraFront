import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.html',
})
export class InputComponent {
  @Input() type: string = 'text';
  @Input() disabled = false;
  @Input() placeholder = '';
  @Input() className = '';
  @Input() value: string = '';

  get classes(): string {
    return [
      'flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base md:text-sm',
      'bg-input-background border-input',
      'transition-[color,box-shadow] outline-none',
      'placeholder:text-muted-foreground',
      'selection:bg-primary selection:text-primary-foreground',
      'dark:bg-input/30',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      this.className,
    ].join(' ');
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
  }
}