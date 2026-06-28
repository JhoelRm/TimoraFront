import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../services/auth';
import { MENU } from '../menu/menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {

  private auth = inject(AuthService);

  menu = MENU;

  user = this.auth.getUser();

  filteredMenu = this.getFilteredMenu();

  private getFilteredMenu() {
    const role = this.user?.role;
    if (!role) return [];
    return this.menu.filter(item => item.roles.includes(role));
  }

  logout() {
    this.auth.logout();
    window.location.href = '/login';
  }
}