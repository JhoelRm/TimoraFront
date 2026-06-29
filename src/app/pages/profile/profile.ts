import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { PersonService } from '../../services/person-identity/person-identity';
import { ButtonComponent } from '../../components/button/button';
import { InputComponent } from '../../components/input/input';
import { AuthService } from '../../services/auth/auth';
import { SessionService } from '../../services/user-session/user-session';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent
  ],
  templateUrl: './profile.html',
})
export class ProfileComponent implements OnInit {

  private fb = inject(FormBuilder);
  private personService = inject(PersonService);
  private auth = inject(AuthService);
  private session = inject(SessionService); // 🔥 FALTABA

  personId!: number;
  userEmail = '';

  supplierExists = false;

  // =========================
  // FORMS
  // =========================
  profileForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    phone: [''],
    email: [''],
    address: [''],
  });

  supplierForm = this.fb.group({
    specialty: [''],
    notes: [''],
  });

  ngOnInit() {
    this.initUser();
  }

  // =========================
  // INIT USER
  // =========================
  private initUser() {
    const user = this.auth.getUser();

    if (!user) return;

    this.personId = user.personId;
    this.userEmail = user.email;

    this.loadProfile();
  }

  // =========================
  // LOAD PROFILE
  // =========================
  loadProfile() {

    this.personService.getById(this.personId).subscribe({
      next: (res: any) => {

        const p = res.person;
        const s = res.supplier;

        this.profileForm.patchValue({
          firstName: p?.firstName ?? '',
          lastName: p?.lastName ?? '',
          phone: p?.phone ?? '',
          email: p?.email ?? '',
          address: p?.address ?? '',
        });

        this.supplierExists = !!s;

        if (s) {
          this.supplierForm.patchValue({
            specialty: s.specialty ?? '',
            notes: s.notes ?? '',
          });
        } else {
          this.supplierForm.reset();
        }
      },
      error: (err) => {
        console.error('PROFILE LOAD ERROR', err);
      }
    });
  }

  // =========================
  // SAVE
  // =========================
  save() {

    const person = this.clean(this.profileForm.value);
    const supplier = this.supplierExists
      ? this.clean(this.supplierForm.value)
      : undefined;

    const body: any = { person };

    if (supplier && Object.keys(supplier).length > 0) {
      body.supplier = supplier;
    }

    console.log('🚀 PATCH BODY SENT:', body);

    this.personService.patch(this.personId, body).subscribe({
      next: (res: any) => {

        console.log('UPDATED', res);

        // =========================
        // 🔥 ACTUALIZAR SIDEBAR
        // =========================
        const current = this.session.getSnapshot();

        if (current) {
          this.session.updatePartial({
            firstName: res.person.firstName,
            lastName: res.person.lastName,
          });
        }

        // refrescar form con backend real
        this.loadProfile();
      },
      error: (err) => console.error('SAVE ERROR', err),
    });
  }

  // =========================
  // CLEAN SAFE FOR PATCH
  // =========================
  private clean(obj: any) {

    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) =>
          v !== null &&
          v !== undefined &&
          v !== ''
        )
    );
  }
}