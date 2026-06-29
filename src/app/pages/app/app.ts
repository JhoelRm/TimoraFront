import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, Observable } from 'rxjs';

import { SidebarComponent } from '../../layout/sidebar/sidebar/sidebar';
import { HeaderComponent } from '../../layout/header/header';
import { NotificationsDrawerComponent } from '../../layout/notifications-drawer/notifications-drawer';
import { NotificationService } from '../../services/notification/notification';
import { PAGE_TITLES } from '../../config/page-titles';

import { SessionService } from '../../services/user-session/user-session';
import { UserSession } from '../../models/userSession';
@Component({
  selector: 'app-app',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    NotificationsDrawerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  private notifications = inject(NotificationService);
  private router = inject(Router);
  private session = inject(SessionService);

  title = 'Dashboard';

  user$!: Observable<UserSession>;

  constructor() {
    this.user$ = this.session.getMe(); //aquí traes usuario

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.title = PAGE_TITLES[event.urlAfterRedirects] ?? 'App';
      });
  }
  toggleNotifications() {
    this.notifications.toggle();
  }

  closeNotifications() {
    this.notifications.close();
  }
}