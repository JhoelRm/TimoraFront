import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, Observable, Subscription } from 'rxjs';

import { SidebarComponent } from '../../layout/sidebar/sidebar/sidebar';
import { HeaderComponent } from '../../layout/header/header';
import { NotificationsDrawerComponent } from '../../layout/notifications-drawer/notifications-drawer';

import { NotificationService } from '../../services/notification/notification';
import { ConfigurationService } from '../../services/configuration/configuration';

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
export class AppComponent implements OnDestroy {

  private notifications = inject(NotificationService);
  private router = inject(Router);
  private session = inject(SessionService);
  private configurationService = inject(ConfigurationService);

  private sub = new Subscription();

  title = 'Dashboard';

  user$!: Observable<UserSession>;

  constructor() {

    this.user$ = this.session.getMe();

    this.notifications.startPolling(5000);

    // Cargar configuración del usuario
    this.sub.add(
      this.configurationService.refreshMy().subscribe({
        error: err => console.error('Error loading configuration', err)
      })
    );

    // Escuchar cambios de configuración
    this.sub.add(
      this.configurationService.config$
        .subscribe(config => {

          if (!config) return;

          this.applyTheme(config.darkMode);

        })
    );

    // Cambio de título
    this.sub.add(
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.title = PAGE_TITLES[event.urlAfterRedirects] ?? 'App';
        })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleNotifications() {
    this.notifications.toggle();
  }

  closeNotifications() {
    this.notifications.close();
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }

}