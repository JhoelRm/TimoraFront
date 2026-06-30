import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { PersonService } from '../../services/person-identity/person-identity';
import { PersonIdentityDTO } from '../../models/person-identity';
import { LucideAngularModule, Search, Plus, Pencil, Trash2, Shield } from 'lucide-angular';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class UsersComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private personService = inject(PersonService);

  icons = { Shield, Search, Plus, Trash2, Pencil };

  users: PersonIdentityDTO[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.personService.getAll().subscribe({
      next: data => {
        this.users = data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCreate() { console.log('Create user'); }
  onEdit(id: number) { console.log('Edit user', id); }
  onDelete(id: number) { console.log('Delete user', id); }
}