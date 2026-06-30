import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardComponent } from '../../components/card/card/card';
import { CardContentComponent } from '../../components/card/card-content/card-content';

import { Configuration } from '../../models/configuration';
import { ConfigurationService } from '../../services/configuration/configuration';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit, OnDestroy {

  private configurationService = inject(ConfigurationService);

  private sub = new Subscription();
  private saveTimeout: any;
  private lastPatch: Partial<Configuration> = {};

  config: Configuration = {
    notifyAppointments: false,
    notifyReservations: false,
    notifyCancellations: false,
    notifyReminders: false,

    appChannelEnabled: false,
    emailChannelEnabled: false,

    darkMode: false,

    reminderMinutesBefore: 30,
  };

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {

    this.sub.add(
      this.configurationService.config$
        .subscribe(cfg => {
          if (!cfg) return;

          this.config = cfg;
        })
    );

  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.flushSave();
  }

  // =========================
  // SAVE QUEUE (DEBOUNCE)
  // =========================
  private queueSave(patch: Partial<Configuration>): void {

    this.lastPatch = {
      ...this.lastPatch,
      ...patch
    };

    clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(() => {

      this.configurationService.patch(this.lastPatch)
        .subscribe({
          error: err => console.error('Error saving configuration', err)
        });

      this.lastPatch = {};

    }, 400);
  }

  private flushSave(): void {

    if (this.saveTimeout) {

      clearTimeout(this.saveTimeout);

      if (Object.keys(this.lastPatch).length > 0) {

        this.configurationService.patch(this.lastPatch)
          .subscribe({
            error: err => console.error('Flush save error', err)
          });

      }

      this.lastPatch = {};

    }

  }

  // =========================
  // TOGGLE
  // =========================
  toggle<K extends keyof Configuration>(key: K): void {

    const current = this.config[key];

    if (typeof current !== 'boolean') {
      return;
    }

    const updated = !current;

    this.config = {
      ...this.config,
      [key]: updated
    };

    this.queueSave({
      [key]: updated
    });

  }

  // =========================
  // SLIDER
  // =========================
  updateReminder(event: Event): void {

    const value = Number((event.target as HTMLInputElement).value);

    this.config = {
      ...this.config,
      reminderMinutesBefore: value
    };

    this.queueSave({
      reminderMinutesBefore: value
    });

  }

}