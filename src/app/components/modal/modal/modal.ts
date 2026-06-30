import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
})
export class ModalComponent {

  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  close() {
    this.openChange.emit(false);
  }
}