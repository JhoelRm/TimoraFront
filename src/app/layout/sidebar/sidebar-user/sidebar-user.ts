import { ChangeDetectorRef,Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { SessionService} from '../../../services/user-session/user-session';
import { UserSession } from '../../../models/userSession';

@Component({
  selector: 'app-sidebar-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-user.html',
})
export class SidebarUserComponent implements OnInit {

  private session = inject(SessionService);
  private cdr = inject(ChangeDetectorRef);
  user: UserSession | null = null;
  ngOnInit() {
    this.session.getMe().subscribe({
      next: (data) => {
        this.user = data;
        this.cdr.markForCheck();
      }
    });
  }

  get fullName(): string {
    return [this.user?.firstName, this.user?.lastName]
      .filter(Boolean)
      .join(' ');
  }

  get initial(): string {
    return this.user?.firstName?.charAt(0).toUpperCase() ?? 'U';
  }

}