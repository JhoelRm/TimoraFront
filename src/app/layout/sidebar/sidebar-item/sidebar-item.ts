import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuItem } from '../../../config/menu';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar-item.html',
})
export class SidebarItemComponent {

  @Input() item!: MenuItem;

  private router = inject(Router);

  navigate() {
    this.router.navigate([this.item.route]);
  }

  isActive(): boolean {
    return this.router.url === this.item.route;
  }
}