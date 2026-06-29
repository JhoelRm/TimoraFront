import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company.html',
  styleUrl: './company.scss',
})
export class CompanyComponent {}