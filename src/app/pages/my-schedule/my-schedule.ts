// my-schedule/my-schedule.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, 
  CalendarDays, List, Plus, ChevronLeft, ChevronRight,
  User, Briefcase, Shield, Clock } from 'lucide-angular';
import { MyScheduleService } from '../../services/my-schedule/my-schedule';
import { AuthService } from '../../services/auth/auth';
import { MyScheduleSupplier } from '../../models/my-schedule';
import { Permission } from '../../models/permission';
import { MyScheduleSupplierSelectorComponent } from './components/my-schedule-supplier-selector/my-schedule-supplier-selector';
import { BookingsComponent } from './components/bookings/bookings';
import { AvailabilitiesComponent } from './components/availabilities/availabilities';
import { ServicesComponent } from './components/services/services';  // ← IMPORTAR SERVICES
// import { CustomersComponent } from './components/customers/customers.component'; // ← Para cuando esté listo

export type ScheduleTab = 'BOOKINGS' | 'AVAILABILITY' | 'SERVICES' | 'CUSTOMERS';

// Definición de tabs con sus permisos requeridos
interface TabConfig {
  key: ScheduleTab;
  label: string;
  icon: any;
  readPermission: Permission;
  permissions: Permission[];
}

@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideAngularModule,
    MyScheduleSupplierSelectorComponent,
    BookingsComponent,
    AvailabilitiesComponent,
    ServicesComponent,  // ← AGREGAR SERVICES
    // CustomersComponent, // ← Para cuando esté listo
  ],
  templateUrl: './my-schedule.html',
  styleUrls: ['./my-schedule.scss']
})
export class MyScheduleComponent implements OnInit {
  // Icons
  icons = {
    CalendarDays,
    List,
    Plus,
    ChevronLeft,
    ChevronRight,
    User,
    Briefcase,
    Shield,
    Clock
  };

  // Estado
  suppliers: MyScheduleSupplier[] = [];
  selectedSupplierId: number | null = null;
  selectedSupplier: MyScheduleSupplier | null = null;
  activeTab: ScheduleTab = 'BOOKINGS';
  isLoading = true;
  error: string | null = null;

  // Permisos del supplier seleccionado
  supplierPermissions: Permission[] = [];

  // Configuración de tabs con sus permisos requeridos
  private allTabs: TabConfig[] = [
    {
      key: 'BOOKINGS',
      label: 'Bookings',
      icon: this.icons.CalendarDays,
      readPermission: Permission.BOOKING_READ,
      permissions: [
        Permission.BOOKING_CREATE,
        Permission.BOOKING_READ,
        Permission.BOOKING_UPDATE,
        Permission.BOOKING_DELETE
      ]
    },
    {
      key: 'AVAILABILITY',
      label: 'Availability',
      icon: this.icons.Clock,
      readPermission: Permission.AVAILABILITY_READ,
      permissions: [
        Permission.AVAILABILITY_CREATE,
        Permission.AVAILABILITY_READ,
        Permission.AVAILABILITY_UPDATE,
        Permission.AVAILABILITY_DELETE
      ]
    },
    {
      key: 'SERVICES',
      label: 'Services',
      icon: this.icons.List,
      readPermission: Permission.SERVICE_READ,
      permissions: [
        Permission.SERVICE_CREATE,
        Permission.SERVICE_READ,
        Permission.SERVICE_UPDATE,
        Permission.SERVICE_DELETE
      ]
    },
    {
      key: 'CUSTOMERS',
      label: 'Customers',
      icon: this.icons.User,
      readPermission: Permission.CUSTOMER_READ,
      permissions: [
        Permission.CUSTOMER_CREATE,
        Permission.CUSTOMER_READ,
        Permission.CUSTOMER_UPDATE,
        Permission.CUSTOMER_DELETE
      ]
    }
  ];

  // Tabs disponibles (filtrados por permisos)
  availableTabs: TabConfig[] = [];

  private myScheduleService = inject(MyScheduleService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadSuppliers();
  }

  /**
   * Carga los suppliers a los que el usuario tiene permisos
   */
  loadSuppliers(): void {
    this.isLoading = true;
    this.error = null;

    this.myScheduleService.getMySuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;

        // Seleccionar el primer supplier por defecto
        if (this.suppliers.length > 0) {
          this.selectSupplier(this.suppliers[0].supplierId);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading suppliers:', err);
        this.error = 'Could not load suppliers. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Selecciona un supplier para ver su schedule
   */
  selectSupplier(supplierId: number): void {
    this.selectedSupplierId = supplierId;
    this.selectedSupplier = this.suppliers.find(s => s.supplierId === supplierId) || null;

    if (this.selectedSupplier) {
      this.supplierPermissions = this.selectedSupplier.permissions;
      // Actualizar tabs disponibles según permisos
      this.updateAvailableTabs();
      
      // Si el tab activo no está disponible, seleccionar el primero disponible
      const tabAvailable = this.availableTabs.some(t => t.key === this.activeTab);
      if (!tabAvailable && this.availableTabs.length > 0) {
        this.activeTab = this.availableTabs[0].key;
      }
    }

    this.cdr.detectChanges();
  }

  /**
   * Actualiza la lista de tabs disponibles según los permisos del supplier
   */
  private updateAvailableTabs(): void {
    this.availableTabs = this.allTabs.filter(tab => 
      this.hasPermission(tab.readPermission)
    );
  }

  /**
   * Cambia la pestaña activa (Bookings, Availability, Services, Customers)
   */
  setActiveTab(tab: ScheduleTab): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  /**
   * Verifica si el supplier seleccionado tiene un permiso específico
   */
  hasPermission(permission: Permission): boolean {
    return this.supplierPermissions.includes(permission);
  }

  /**
   * Verifica si el supplier tiene algún permiso de una categoría específica
   */
  hasAnyPermissionInCategory(categoryPermissions: Permission[]): boolean {
    return categoryPermissions.some(p => this.supplierPermissions.includes(p));
  }

  /**
   * Obtiene los permisos de una categoría específica
   */
  getCategoryPermissions(category: 'BOOKING' | 'AVAILABILITY' | 'SERVICE' | 'CUSTOMER'): Permission[] {
    switch(category) {
      case 'BOOKING':
        return [
          Permission.BOOKING_CREATE,
          Permission.BOOKING_READ,
          Permission.BOOKING_UPDATE,
          Permission.BOOKING_DELETE
        ];
      case 'AVAILABILITY':
        return [
          Permission.AVAILABILITY_CREATE,
          Permission.AVAILABILITY_READ,
          Permission.AVAILABILITY_UPDATE,
          Permission.AVAILABILITY_DELETE
        ];
      case 'SERVICE':
        return [
          Permission.SERVICE_CREATE,
          Permission.SERVICE_READ,
          Permission.SERVICE_UPDATE,
          Permission.SERVICE_DELETE
        ];
      case 'CUSTOMER':
        return [
          Permission.CUSTOMER_CREATE,
          Permission.CUSTOMER_READ,
          Permission.CUSTOMER_UPDATE,
          Permission.CUSTOMER_DELETE
        ];
      default:
        return [];
    }
  }

  /**
   * Verifica si el supplier tiene al menos un permiso de lectura en alguna categoría
   */
  hasAnyReadPermission(): boolean {
    return this.availableTabs.length > 0;
  }

  /**
   * Obtiene el nombre del supplier seleccionado
   */
  getSelectedSupplierName(): string {
    if (!this.selectedSupplier) return '';
    return `${this.selectedSupplier.person.firstName} ${this.selectedSupplier.person.lastName}`;
  }

  /**
   * Obtiene la especialidad del supplier seleccionado
   */
  getSelectedSupplierSpecialty(): string {
    return this.selectedSupplier?.specialty || 'Supplier';
  }

  /**
   * Maneja el retry desde el selector
   */
  onRetry(): void {
    this.loadSuppliers();
  }

  // ==================== MÉTODOS PARA BADGES ====================
  hasBookingPermission(): boolean {
    return this.hasAnyPermissionInCategory(this.getCategoryPermissions('BOOKING'));
  }

  hasAvailabilityPermission(): boolean {
    return this.hasAnyPermissionInCategory(this.getCategoryPermissions('AVAILABILITY'));
  }

  hasServicePermission(): boolean {
    return this.hasAnyPermissionInCategory(this.getCategoryPermissions('SERVICE'));
  }

  hasCustomerPermission(): boolean {
    return this.hasAnyPermissionInCategory(this.getCategoryPermissions('CUSTOMER'));
  }

  hasAnyCategoryPermission(): boolean {
    return this.hasBookingPermission() ||
           this.hasAvailabilityPermission() ||
           this.hasServicePermission() ||
           this.hasCustomerPermission();
  }

  // ==================== PERMISOS PARA BOOKINGS ====================
  get hasBookingCreate(): boolean {
    return this.hasPermission(Permission.BOOKING_CREATE);
  }

  get hasBookingRead(): boolean {
    return this.hasPermission(Permission.BOOKING_READ);
  }

  get hasBookingUpdate(): boolean {
    return this.hasPermission(Permission.BOOKING_UPDATE);
  }

  get hasBookingDelete(): boolean {
    return this.hasPermission(Permission.BOOKING_DELETE);
  }

  // ==================== PERMISOS PARA AVAILABILITY ====================
  get hasAvailabilityCreate(): boolean {
    return this.hasPermission(Permission.AVAILABILITY_CREATE);
  }

  get hasAvailabilityRead(): boolean {
    return this.hasPermission(Permission.AVAILABILITY_READ);
  }

  get hasAvailabilityUpdate(): boolean {
    return this.hasPermission(Permission.AVAILABILITY_UPDATE);
  }

  get hasAvailabilityDelete(): boolean {
    return this.hasPermission(Permission.AVAILABILITY_DELETE);
  }

  // ==================== PERMISOS PARA SERVICES ====================
  get hasServiceCreate(): boolean {
    return this.hasPermission(Permission.SERVICE_CREATE);
  }

  get hasServiceRead(): boolean {
    return this.hasPermission(Permission.SERVICE_READ);
  }

  get hasServiceUpdate(): boolean {
    return this.hasPermission(Permission.SERVICE_UPDATE);
  }

  get hasServiceDelete(): boolean {
    return this.hasPermission(Permission.SERVICE_DELETE);
  }

  // ==================== PERMISOS PARA CUSTOMERS ====================
  get hasCustomerCreate(): boolean {
    return this.hasPermission(Permission.CUSTOMER_CREATE);
  }

  get hasCustomerRead(): boolean {
    return this.hasPermission(Permission.CUSTOMER_READ);
  }

  get hasCustomerUpdate(): boolean {
    return this.hasPermission(Permission.CUSTOMER_UPDATE);
  }

  get hasCustomerDelete(): boolean {
    return this.hasPermission(Permission.CUSTOMER_DELETE);
  }
}