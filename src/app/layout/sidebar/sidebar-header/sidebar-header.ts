import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
@Component({
  selector: 'app-sidebar-header',
  standalone: true,
  imports: [CommonModule,LucideAngularModule],
  templateUrl: './sidebar-header.html',
})
export class SidebarHeaderComponent {}