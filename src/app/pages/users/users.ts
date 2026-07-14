import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonService } from '../../services/person-identity/person-identity';
import { CompaniesService } from '../../services/companies/companies';
import { AuthService } from '../../services/auth/auth';
import { PermissionService } from '../../services/permissions/perimssions';
import { PersonIdentityDTO } from '../../models/person-identity';
import { CompanyDTO } from '../../models/company';
import { CurrentUser } from '../../models/currentUser';
import {
  Permission,
  PermissionGroupsWithLabels,
  UserPermissionMapResponse,
  UserSupplierPermissionCreateDTO
} from '../../models/permission';
import { LucideAngularModule, Search, Plus, Pencil, Trash2, Shield, X, CheckCircle, Lock, Loader2 } from 'lucide-angular';
import { ModalComponent } from '../../components/modal/modal/modal';

type Role = 'OWNER' | 'ADMIN' | 'USER';
type AccountType = 'USER' | 'STAFF' | 'USER_STAFF';

interface UserForm {
  accountType: AccountType;
  companyId: number | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  specialty: string;
  notes: string;
  role: Role;
}

interface EditUserForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  role: Role | null;
  supplier: {
    specialty: string;
    notes: string;
  } | null;
}

interface SupplierPermission {
  supplierId: number;
  supplier: NonNullable<PersonIdentityDTO['supplier']>;
  person: PersonIdentityDTO['person'];
  permissions: Set<Permission>;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class UsersComponent implements OnInit {
  
  isEditMode = false;
  editModalOpen = false;
  editUserId: number | null = null;

  deleteModalOpen = false;
  userToDelete: PersonIdentityDTO | null = null;

  // PERMISSIONS MODAL
  permissionsModalOpen = false;
  selectedUser: PersonIdentityDTO | null = null;
  selectedUserId: number | null = null; // Esto es USER.id
  selectedSupplierId: number | null = null;
  supplierPermissions: SupplierPermission[] = [];
  availableSuppliers: (NonNullable<PersonIdentityDTO['supplier']> & { person: PersonIdentityDTO['person'] })[] = [];

  private originalPermissions: SupplierPermission[] = [];
  private permissionsToAdd: { supplierId: number; permission: Permission }[] = [];
  private permissionsToRemove: { supplierId: number; permission: Permission }[] = [];

  public hasChanges = false;
  public isSaving = false;
  public isLoadingPermissions = false;

  userForm: UserForm = this.createEmptyForm();
  editForm: EditUserForm = this.createEmptyEditForm();

  ready = false;
  loading = false;
  currentUser: CurrentUser | null = null;
  allUsers: PersonIdentityDTO[] = [];
  users: PersonIdentityDTO[] = [];
  companies: CompanyDTO[] = [];
  searchTerm = '';
  selectedCompanyId: number | null = null;
  modalOpen = false;

  permissionGroups = PermissionGroupsWithLabels;
  icons = { Search, Plus, Pencil, Trash2, Shield, X, CheckCircle, Lock, Loader2 };
  availableRoles: Role[] = [];

  private personService = inject(PersonService);
  private companiesService = inject(CompaniesService);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);

  get isOwner() { return this.currentUser?.role === 'OWNER' }
  get canSelectCompany() { return this.isOwner }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.initContext();
    this.loadData();
  }

  getRole(u: PersonIdentityDTO) {
    return u.user?.role ?? 'STAFF';
  }

  private initContext() {
    this.setAvailableRoles();
    this.setCompanyContext();
  }

  private loadData() {
    if (this.isOwner) this.loadCompanies();
    this.loadUsers();
  }

  private setAvailableRoles() {
    const r = this.currentUser?.role;
    this.availableRoles = {
      OWNER: ['OWNER', 'ADMIN', 'USER'],
      ADMIN: ['ADMIN', 'USER'],
      USER: ['USER']
    }[r ?? 'USER'] as Role[];
  }

  private setCompanyContext() {
    const u = this.currentUser;
    if (u?.role === 'ADMIN') this.selectedCompanyId = u.companyId ?? null;
    if (u?.role === 'OWNER') this.selectedCompanyId = null;
  }

  private loadCompanies() {
    this.companiesService.getAll().subscribe({
      next: d => { 
        this.companies = (d ?? []).filter(c => c.status === 'ACTIVE'); 
        this.cdr.detectChanges();
      },
      error: console.error
    });
  }

  private loadUsers() {
    this.loading = true;
    this.personService.getAll().subscribe({
      next: d => {
        this.allUsers = (d ?? []).filter(x => x.user !== null && x.user !== undefined);
        this.loading = false;
        this.ready = true;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: e => {
        console.error(e);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter() {
    const u = this.currentUser;
    let r = [...this.allUsers];
    if (u?.role === 'ADMIN' && u.companyId)
      r = r.filter(x => x.person.companyId === u.companyId);
    if (u?.role === 'OWNER' && this.selectedCompanyId !== null)
      r = r.filter(x => x.person.companyId === this.selectedCompanyId);
    const t = this.searchTerm.trim().toLowerCase();
    if (t)
      r = r.filter(x =>
        (x.person.firstName ?? '').toLowerCase().includes(t) ||
        (x.person.lastName ?? '').toLowerCase().includes(t) ||
        (x.user?.email ?? '').toLowerCase().includes(t) ||
        (x.person.phone ?? '').toLowerCase().includes(t)
      );
    this.users = r;
  }

  onCompanyChange() { this.applyFilter(); this.cdr.detectChanges() }
  onSearchChange() { this.applyFilter() }

  onEdit(u: PersonIdentityDTO) {
    this.isEditMode = true;
    this.editUserId = u.person.id;
    this.editForm = {
      firstName: u.person.firstName,
      lastName: u.person.lastName,
      phone: u.person.phone,
      email: u.user?.email ?? '',
      address: u.person.address ?? '',
      role: (u.user?.role ?? null) as Role | null,
      supplier: u.supplier ? {
        specialty: u.supplier.specialty ?? '',
        notes: u.supplier.notes ?? ''
      } : null
    };
    this.editModalOpen = true;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editUserId = null;
    this.userForm = this.createEmptyForm();
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  closeEditModal() {
    this.editModalOpen = false;
    this.editUserId = null;
  }

  createUser() {
    const f = this.userForm;
    const companyId = this.currentUser?.role === 'OWNER' ? f.companyId : this.currentUser?.companyId;
    if (!companyId) {
      console.error('Company ID is required');
      return;
    }
    const payload: any = {
      person: {
        firstName: f.firstName,
        lastName: f.lastName,
        phone: f.phone,
        email: f.email,
        address: f.address ?? '',
        companyId
      },
      user: null,
      supplier: null,
      customer: null
    };
    if (f.accountType !== 'STAFF') {
      payload.user = { email: f.email, password: f.password, companyId, role: f.role };
    }
    if (f.accountType !== 'USER') {
      payload.supplier = { companyId, specialty: f.specialty, notes: f.notes };
    }
    this.personService.create(payload).subscribe({
      next: () => {
        this.modalOpen = false;
        this.loadUsers();
      },
      error: console.error
    });
  }

  updateUser() {
    if (!this.editUserId) {
      console.error('No user ID for update');
      return;
    }
    const f = this.editForm;
    const payload: any = {
      person: { firstName: f.firstName, lastName: f.lastName, phone: f.phone, address: f.address }
    };
    if (f.role) {
      payload.user = { email: f.email, role: f.role };
    }
    if (f.supplier) {
      payload.supplier = { specialty: f.supplier.specialty, notes: f.supplier.notes };
    }
    this.personService.patch(this.editUserId, payload).subscribe({
      next: () => {
        this.editModalOpen = false;
        this.editUserId = null;
        this.loadUsers();
      },
      error: console.error
    });
  }

  submit() {
    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  onDelete(user: PersonIdentityDTO) {
    this.userToDelete = user;
    this.deleteModalOpen = true;
  }

  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.userToDelete = null;
  }

  confirmDelete() {
    if (!this.userToDelete) return;
    this.personService.delete(this.userToDelete.person.id).subscribe({
      next: () => {
        this.deleteModalOpen = false;
        this.userToDelete = null;
        this.loadUsers();
      },
      error: console.error
    });
  }

  // ============================================================
  // PERMISSIONS LOGIC - MEJORADO
  // ============================================================

  openPermissionsModal(user: PersonIdentityDTO) {
    // Validación: Solo USER o STAFF pueden tener permisos
    if (!user.user || (user.user.role !== 'USER' && user.user.role !== 'STAFF')) {
      console.warn('User is not USER or STAFF, cannot manage permissions');
      return;
    }

    // Resetear estado
    this.supplierPermissions = [];
    this.availableSuppliers = [];
    this.originalPermissions = [];
    this.permissionsToAdd = [];
    this.permissionsToRemove = [];
    this.hasChanges = false;
    this.isSaving = false;
    this.isLoadingPermissions = false;

    // Guardar usuario seleccionado
    this.selectedUser = user;
    // ✅ IMPORTANTE: Usar user.id (no person.id)
    this.selectedUserId = user.user.id;
    
    // Abrir modal
    this.permissionsModalOpen = true;
    
    // Cargar permisos
    this.loadSupplierPermissions();
  }

  closePermissionsModal() {
    if (this.isSaving) return;
    
    // Si hay cambios y no estamos guardando, preguntar
    if (this.hasChanges) {
      if (confirm('Tienes cambios sin guardar. ¿Quieres guardarlos antes de cerrar?')) {
        this.saveAllPermissions();
        return;
      }
      // Si el usuario cancela, descartar cambios
      this.discardChanges();
    }
    
    this.permissionsModalOpen = false;
    this.cleanupPermissionsState();
  }

  private discardChanges() {
    // Restaurar permisos originales
    this.supplierPermissions = this.originalPermissions.map(sp => ({
      ...sp,
      permissions: new Set(sp.permissions)
    }));
    this.permissionsToAdd = [];
    this.permissionsToRemove = [];
    this.hasChanges = false;
  }

  private cleanupPermissionsState() {
    this.selectedUser = null;
    this.selectedUserId = null;
    this.selectedSupplierId = null;
    this.supplierPermissions = [];
    this.availableSuppliers = [];
    this.originalPermissions = [];
    this.permissionsToAdd = [];
    this.permissionsToRemove = [];
    this.hasChanges = false;
    this.isSaving = false;
    this.isLoadingPermissions = false;
  }

saveAllPermissions() {
  console.log('\n💾 === SAVE ALL PERMISSIONS ===');
  console.log('📊 Estado actual:');
  console.log(`  - selectedUserId: ${this.selectedUserId}`);
  console.log(`  - isSaving: ${this.isSaving}`);
  console.log(`  - permissionsToAdd: ${this.permissionsToAdd.length}`);
  console.log(`  - permissionsToRemove: ${this.permissionsToRemove.length}`);
  console.log('📝 Detalle de cambios:');
  console.log('  ➕ Añadir:', this.permissionsToAdd);
  console.log('  ➖ Eliminar:', this.permissionsToRemove);
  
  if (!this.selectedUserId || this.isSaving) {
    console.warn('⚠️ No se puede guardar: selectedUserId o isSaving true');
    return;
  }
  
  if (this.permissionsToAdd.length === 0 && this.permissionsToRemove.length === 0) {
    console.log('ℹ️ No hay cambios para guardar');
    this.hasChanges = false;
    this.permissionsModalOpen = false;
    this.cleanupPermissionsState();
    return;
  }

  console.log('⏳ Iniciando guardado...');
  this.isSaving = true;
  this.cdr.detectChanges();

  // Construir operaciones
  const operations: (() => Promise<any>)[] = [
    ...this.permissionsToRemove.map(r => {
      const payload = {
        userId: this.selectedUserId!,
        supplierId: r.supplierId,
        permission: r.permission
      };
      console.log(`🗑️ Preparando DELETE:`, payload);
      return () => {
        console.log(`🗑️ Ejecutando DELETE para ${r.permission} en supplier ${r.supplierId}`);
        return this.permissionService.delete(payload).toPromise();
      };
    }),
    ...this.permissionsToAdd.map(a => {
      const payload = {
        userId: this.selectedUserId!,
        supplierId: a.supplierId,
        permission: a.permission
      };
      console.log(`➕ Preparando CREATE:`, payload);
      return () => {
        console.log(`➕ Ejecutando CREATE para ${a.permission} en supplier ${a.supplierId}`);
        return this.permissionService.create(payload).toPromise();
      };
    })
  ];

  console.log(`📊 Total de operaciones a ejecutar: ${operations.length}`);
  this.executeSequentially(operations);
}

private async executeSequentially(operations: (() => Promise<any>)[]) {
  let hasError = false;
  
  console.log('🚀 === INICIANDO EJECUCIÓN SECUENCIAL ===');
  console.log(`📊 Total de operaciones: ${operations.length}`);
  console.log('📋 Operaciones a ejecutar:', operations.map((_, i) => `Op ${i + 1}`));
  
  try {
    let opIndex = 0;
    for (const op of operations) {
      opIndex++;
      console.log(`\n🔄 === Operación ${opIndex}/${operations.length} ===`);
      
      try {
        console.log('⏳ Ejecutando operación...');
        const result = await op();
        console.log('✅ Operación exitosa:', result);
      } catch (error: any) {
        console.error(`❌ Error en operación ${opIndex}:`, error);
        console.error('📝 Detalles del error:', {
          message: error.message,
          errorObject: error.error,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        
        // Log del body si existe
        if (error.error) {
          console.log('📦 Body del error:', error.error);
        }
        
        // Ignorar errores de "ya existe" o "no existe"
        if (error.error?.message === 'Permission does not exist' || 
            error.error?.message === 'Permission already exists') {
          console.log('⚠️ Error ignorado (permiso ya existe o no existe)');
          continue;
        }
        
        console.error('💥 Error no ignorable, deteniendo ejecución');
        hasError = true;
        break;
      }
    }

    console.log('\n📊 === RESUMEN FINAL ===');
    console.log(`✅ Éxito: ${!hasError}`);
    console.log(`📝 Cambios pendientes: ${this.permissionsToAdd.length} añadir, ${this.permissionsToRemove.length} eliminar`);

    // Recargar permisos después de guardar
    setTimeout(() => {
      console.log('🔄 Limpiando estado después de guardar...');
      this.isSaving = false;
      this.hasChanges = false;
      this.permissionsToAdd = [];
      this.permissionsToRemove = [];
      
      if (!hasError) {
        console.log('✅ Todo bien, cerrando modal');
        this.permissionsModalOpen = false;
        this.cleanupPermissionsState();
      } else {
        console.log('⚠️ Hubo errores, recargando permisos');
        this.loadSupplierPermissions();
      }
      this.cdr.detectChanges();
    }, 0);
    
  } catch (error) {
    console.error('💥 Error catastrófico en operaciones de permisos:', error);
    setTimeout(() => {
      this.isSaving = false;
      this.loadSupplierPermissions();
      this.cdr.detectChanges();
    }, 0);
  }
}

  loadSupplierPermissions() {
    if (!this.selectedUserId) {
      console.warn('No selected user ID');
      return;
    }

    this.isLoadingPermissions = true;
    this.supplierPermissions = [];
    this.availableSuppliers = [];
    this.cdr.detectChanges();

    this.permissionService.getPermissionMap(this.selectedUserId).subscribe({
      next: (permissionMap: UserPermissionMapResponse) => {
        const supplierIds = Object.keys(permissionMap).map(Number);
        
        // Si no hay permisos, cargar suppliers disponibles
        if (supplierIds.length === 0) {
          this.supplierPermissions = [];
          this.originalPermissions = [];
          this.loadAvailableSuppliers();
          this.isLoadingPermissions = false;
          this.cdr.detectChanges();
          return;
        }

        // Buscar los suppliers que tienen permisos
        this.personService.getAll().subscribe({
          next: (allUsers) => {
            const supplierUsers = allUsers
              .filter(u => u.supplier !== null && u.supplier !== undefined)
              .filter(u => supplierIds.includes(u.supplier!.id));
            
            this.supplierPermissions = supplierUsers.map(u => ({
              supplierId: u.supplier!.id,
              supplier: u.supplier!,
              person: u.person,
              permissions: new Set(permissionMap[u.supplier!.id] || [])
            }));
            
            // Guardar copia original para detectar cambios
            this.originalPermissions = this.supplierPermissions.map(sp => ({
              ...sp,
              permissions: new Set(sp.permissions)
            }));
            
            this.loadAvailableSuppliers();
            this.isLoadingPermissions = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error loading suppliers:', err);
            this.isLoadingPermissions = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.supplierPermissions = [];
        this.originalPermissions = [];
        this.loadAvailableSuppliers();
        this.isLoadingPermissions = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAvailableSuppliers() {
    if (!this.selectedUser) {
      console.warn('No selected user for available suppliers');
      return;
    }

    const companyId = this.selectedUser.person.companyId;
    const currentUserPersonId = this.selectedUser.person.id;

    // Usar this.allUsers que ya está cargado (no hacer otra llamada)
    const allUsers = this.allUsers.length > 0 ? this.allUsers : [];
    
    // Filtrar suppliers de la misma empresa
    const supplierUsers = allUsers
      .filter(u => u.supplier !== null && u.supplier !== undefined)
      .filter(u => u.person.companyId === companyId)
      // Excluir al usuario actual (no puede asignarse permisos a sí mismo)
      .filter(u => u.person.id !== currentUserPersonId);

    // Obtener IDs de suppliers ya asignados
    const assignedSupplierIds = new Set(this.supplierPermissions.map(sp => sp.supplier.id));

    // Suppliers disponibles = no asignados
    this.availableSuppliers = supplierUsers
      .filter(u => !assignedSupplierIds.has(u.supplier!.id))
      .map(u => ({ ...u.supplier!, person: u.person }));

    this.cdr.detectChanges();
  }

  hasPermission(supplierId: number, permission: Permission): boolean {
    const supplierPerm = this.supplierPermissions.find(sp => sp.supplier.id === supplierId);
    return supplierPerm?.permissions.has(permission) || false;
  }

togglePermission(supplierId: number, permission: Permission) {
  console.log(`🔄 TOGGLE PERMISSION: supplier=${supplierId}, permission=${permission}`);
  
  const supplierPerm = this.supplierPermissions.find(sp => sp.supplier.id === supplierId);
  if (!supplierPerm) return;

  const hasPerm = supplierPerm.permissions.has(permission);

  if (hasPerm) {
    // ✅ TIENE permiso → ELIMINAR
    console.log(`🗑️ Removiendo permiso ${permission}`);
    supplierPerm.permissions.delete(permission);
    
    this.permissionsToAdd = this.permissionsToAdd.filter(
      p => !(p.supplierId === supplierId && p.permission === permission)
    );
    
    if (!this.isPendingRemove(supplierId, permission)) {
      this.permissionsToRemove.push({ supplierId, permission });
      console.log(`➕ Añadido a lista de REMOVER: ${permission}`);
    }
  } else {
    // ❌ NO TIENE permiso → CREAR
    console.log(`➕ Añadiendo permiso ${permission}`);
    supplierPerm.permissions.add(permission);
    
    this.permissionsToRemove = this.permissionsToRemove.filter(
      p => !(p.supplierId === supplierId && p.permission === permission)
    );
    
    if (!this.isPendingAdd(supplierId, permission)) {
      this.permissionsToAdd.push({ supplierId, permission });
      console.log(`➕ Añadido a lista de AÑADIR: ${permission}`);
    }
  }

  this.hasChanges = true;
  this.cdr.detectChanges();
}

  private isPendingAdd(supplierId: number, permission: Permission): boolean {
    return this.permissionsToAdd.some(p => p.supplierId === supplierId && p.permission === permission);
  }

  private isPendingRemove(supplierId: number, permission: Permission): boolean {
    return this.permissionsToRemove.some(p => p.supplierId === supplierId && p.permission === permission);
  }


addSupplierPermissions() {
  console.log('\n➕ === ADD SUPPLIER PERMISSIONS ===');
  console.log(`📊 selectedSupplierId: ${this.selectedSupplierId}`);
  console.log(`📊 selectedUserId: ${this.selectedUserId}`);
  
  if (!this.selectedSupplierId || !this.selectedUserId) {
    console.warn('⚠️ No se puede añadir: supplier o userId null');
    return;
  }

  const supplierWithPerson = this.availableSuppliers.find(s => s.id === this.selectedSupplierId);
  if (!supplierWithPerson) {
    console.warn(`⚠️ No se encontró supplier con ID ${this.selectedSupplierId}`);
    return;
  }

  console.log(`✅ Añadiendo supplier: ${supplierWithPerson.person.firstName} ${supplierWithPerson.person.lastName} (ID: ${supplierWithPerson.id})`);

  // Añadir supplier a la lista de permisos
  this.supplierPermissions.push({
    supplierId: supplierWithPerson.id,
    supplier: supplierWithPerson,
    person: supplierWithPerson.person,
    permissions: new Set()
  });

  // Remover de disponibles
  this.availableSuppliers = this.availableSuppliers.filter(s => s.id !== this.selectedSupplierId);
  this.selectedSupplierId = null;
  this.hasChanges = true;
  
  console.log(`📊 Nuevo estado:`);
  console.log(`  - supplierPermissions: ${this.supplierPermissions.length}`);
  console.log(`  - availableSuppliers: ${this.availableSuppliers.length}`);
  console.log(`  - hasChanges: ${this.hasChanges}`);
  
  this.cdr.detectChanges();
}


removeSupplierPermissions(supplierId: number) {
  console.log(`\n🗑️ === REMOVE SUPPLIER PERMISSIONS: supplierId=${supplierId} ===`);
  
  const supplierPerm = this.supplierPermissions.find(sp => sp.supplier.id === supplierId);
  if (!supplierPerm) {
    console.warn(`⚠️ No se encontró supplier con ID ${supplierId}`);
    return;
  }

  const permissionsToRemove = Array.from(supplierPerm.permissions);
  console.log(`📊 Permisos a eliminar: ${permissionsToRemove.length}`, permissionsToRemove);
  
  for (const perm of permissionsToRemove) {
    this.permissionsToAdd = this.permissionsToAdd.filter(
      p => !(p.supplierId === supplierId && p.permission === perm)
    );
    if (!this.isPendingRemove(supplierId, perm)) {
      this.permissionsToRemove.push({ supplierId, permission: perm });
      console.log(`🗑️ Marcado para eliminar: ${perm}`);
    }
  }

  // Remover de la lista
  this.supplierPermissions = this.supplierPermissions.filter(sp => sp.supplier.id !== supplierId);
  
  // Devolver a disponibles
  this.availableSuppliers.push({ ...supplierPerm.supplier, person: supplierPerm.person });
  
  this.hasChanges = true;
  console.log(`📊 Nuevo estado:`);
  console.log(`  - supplierPermissions: ${this.supplierPermissions.length}`);
  console.log(`  - availableSuppliers: ${this.availableSuppliers.length}`);
  console.log(`  - hasChanges: ${this.hasChanges}`);
  
  this.cdr.detectChanges();
}

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  private createEmptyForm(): UserForm {
    return {
      accountType: 'USER',
      companyId: null,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      address: '',
      specialty: '',
      notes: '',
      role: 'USER'
    };
  }

  private createEmptyEditForm(): EditUserForm {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      role: null,
      supplier: null
    };
  }
  get permissionGroupsWithoutCustomer() {
    // Oculta temporalmente el grupo 'Customer'
    return this.permissionGroups.filter(group => group.label !== 'Customers');
  }
  
}