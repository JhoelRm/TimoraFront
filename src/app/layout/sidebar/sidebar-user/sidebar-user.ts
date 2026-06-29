import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../services/user-session/user-session';
import { UserSession } from '../../../models/userSession';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-user.html',
})
export class SidebarUserComponent {

  private session = inject(SessionService);

  user$: Observable<UserSession | null> = this.session.user$;

  // helper opcional para evitar lógica en HTML
  avatarSeed(user: UserSession | null): string {
    return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'User';
  }

  fullName(user: UserSession | null): string {
    return [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ');
  }

  initial(user: UserSession | null): string {
    return user?.firstName?.charAt(0).toUpperCase() ?? 'U';
  }
}