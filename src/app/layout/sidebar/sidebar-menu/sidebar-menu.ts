import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionService } from '../../../services/user-session/user-session';
import { MENU, MenuItem } from '../../../config/menu';

import { SidebarItemComponent } from '../sidebar-item/sidebar-item';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserSession } from '../../../models/userSession';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, SidebarItemComponent],
  templateUrl: './sidebar-menu.html',
})
export class SidebarMenuComponent {

  private session = inject(SessionService);

  /**
   * Estado reactivo del usuario (source of truth)
   */
  user = toSignal(this.session.user$);

  /**
   * Menú base estático
   */
  menu: MenuItem[] = MENU;

  get filteredMenu(): MenuItem[] {
    const user: UserSession | null | undefined = this.user();

    if (!user) return [];

    return this.menu.filter((item) => {
      const modeOk =
        !item.modes ||
        item.modes.includes(user.mode);

      return modeOk;
    });
  }
}