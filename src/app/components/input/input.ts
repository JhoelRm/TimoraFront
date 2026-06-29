import { Component, forwardRef, Input, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.html',
  host: {
    class: 'block w-full',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {

  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;

  value = '';
  showPassword = false;

  private cdr = inject(ChangeDetectorRef);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // =========================
  // Angular → componente
  // =========================
  writeValue(value: string): void {
    this.value = value ?? '';
    this.cdr.markForCheck(); // 🔥 FIX CLAVE
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck(); // 🔥 evita glitches visuales
  }

  // =========================
  // componente → Angular
  // =========================
  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.value = value;
    this.onChange(value);
  }

  handleBlur() {
    this.onTouched();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  get inputType() {
    return this.type === 'password'
      ? this.showPassword ? 'text' : 'password'
      : this.type;
  }
}