import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

import { CardComponent } from '../../components/card/card/card';
import { CardContentComponent } from '../../components/card/card-content/card-content';
import { Button } from '../../components/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    CardContentComponent,
    Button,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {

  private router = inject(Router);
  private auth = inject(AuthService);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        console.log('LOGIN OK:', res);

        // ❌ quitar esto:
        // this.auth.saveSession(res);

        // ✔ navegación
        this.router.navigate(['/app']);
      },

      error: (err) => {
        console.error(err);
        alert('Credenciales incorrectas');
      }
    });
  }
}