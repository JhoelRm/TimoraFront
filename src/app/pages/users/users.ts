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
import { LucideAngularModule, Search, Plus, Pencil, Trash2, Shield, X, CheckCircle, Lock } from 'lucide-angular';
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

  permissionsModalOpen = false;
  selectedUser: PersonIdentityDTO | null = null;
  selectedUserId: number | null = null;
  selectedSupplierId: number | null = null;
  supplierPermissions: SupplierPermission[] = [];
  availableSuppliers: (NonNullable<PersonIdentityDTO['supplier']> & { person: PersonIdentityDTO['person'] })[] = [];

  private originalPermissions: SupplierPermission[] = [];
  private permissionsToAdd: { supplierId: number; permission: Permission }[] = [];
  private permissionsToRemove: { supplierId: number; permission: Permission }[] = [];

  public hasChanges = false;
  public isSaving = false;

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
  icons = { Search, Plus, Pencil, Trash2, Shield, X, CheckCircle, Lock };
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
      next: d => { this.companies = d ?? []; this.cdr.detectChanges() },
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

  openPermissionsModal(user: PersonIdentityDTO) {
    if (user.user?.role !== 'USER' && user.user?.role !== 'STAFF') {
      console.warn('User is not USER or STAFF, cannot manage permissions');
      return;
    }
    this.supplierPermissions = [];
    this.availableSuppliers = [];
    this.originalPermissions = [];
    this.permissionsToAdd = [];
    this.permissionsToRemove = [];
    this.hasChanges = false;
    this.isSaving = false;
    this.selectedUser = user;
    this.selectedUserId = user.person.id;
    this.permissionsModalOpen = true;
    this.loadSupplierPermissions();
  }

  closePermissionsModal() {
    if (this.isSaving) return;
    if (this.hasChanges) {
      this.saveAllPermissions();
      return;
      
    }
    this.permissionsModalOpen = false;
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
  }

  saveAllPermissions() {
    if (!this.selectedUserId || this.isSaving) return;
    if (this.permissionsToAdd.length === 0 && this.permissionsToRemove.length === 0) {
      this.hasChanges = false;
      this.permissionsModalOpen = false;
      return;
    }
    this.isSaving = true;
    this.cdr.detectChanges();
    const operations: (() => Promise<any>)[] = [
      ...this.permissionsToRemove.map(r => () => this.permissionService.delete({
        userId: this.selectedUserId!,
        supplierId: r.supplierId,
        permission: r.permission
      }).toPromise()),
      ...this.permissionsToAdd.map(a => () => this.permissionService.create({
        userId: this.selectedUserId!,
        supplierId: a.supplierId,
        permission: a.permission
      }).toPromise())
    ];
    this.executeSequentially(operations);
  }

  private async executeSequentially(operations: (() => Promise<any>)[]) {
    try {
      for (const op of operations) {
        try {
          await op();
        } catch (error: any) {
          if (error.error?.message === 'Permission does not exist' || error.error?.message === 'Permission already exists') {
            continue;
          }
          throw error;
        }
      }
      setTimeout(() => {
        this.isSaving = false;
        this.hasChanges = false;
        this.permissionsToAdd = [];
        this.permissionsToRemove = [];
        this.permissionsModalOpen = false;
        this.loadSupplierPermissions();
        this.cdr.detectChanges();
      }, 0);
    } catch (error) {
      console.error('Error in permission operation:', error);
      setTimeout(() => {
        this.isSaving = false;
        this.loadSupplierPermissions();
        //alert('Error saving permissions. Please try again.');
        this.cdr.detectChanges();
      }, 0);
    }
  }

  loadSupplierPermissions() {
    if (!this.selectedUserId) return;
    this.supplierPermissions = [];
    this.originalPermissions = [];
    this.availableSuppliers = [];
    this.permissionsToAdd = [];
    this.permissionsToRemove = [];
    this.permissionService.getPermissionMap(this.selectedUserId).subscribe({
      next: (permissionMap: UserPermissionMapResponse) => {
        const supplierIds = Object.keys(permissionMap).map(Number);
        if (supplierIds.length === 0) {
          this.supplierPermissions = [];
          this.originalPermissions = [];
          this.loadAvailableSuppliers();
          this.cdr.detectChanges();
          return;
        }
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
            this.originalPermissions = this.supplierPermissions.map(sp => ({
              ...sp,
              permissions: new Set(sp.permissions)
            }));
            this.loadAvailableSuppliers();
            this.cdr.detectChanges();
          },
          error: console.error
        });
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.supplierPermissions = [];
        this.originalPermissions = [];
        this.loadAvailableSuppliers();
      }
    });
  }

  loadAvailableSuppliers() {
    if (!this.selectedUser) return;
    const companyId = this.selectedUser.person.companyId;
    const currentSupplierId = this.selectedUser.supplier?.id;
    this.personService.getAll().subscribe({
      next: (allUsers) => {
        const supplierUsers = allUsers
          .filter(u => u.supplier !== null && u.supplier !== undefined)
          .filter(u => u.person.companyId === companyId);
        const assignedSupplierIds = new Set(this.supplierPermissions.map(sp => sp.supplier.id));
        this.availableSuppliers = supplierUsers
          .filter(u => {
            const supplierId = u.supplier!.id;
            if (assignedSupplierIds.has(supplierId)) return false;
            if (currentSupplierId && supplierId === currentSupplierId) return false;
            return true;
          })
          .map(u => ({ ...u.supplier!, person: u.person }));
        this.cdr.detectChanges();
      },
      error: console.error
    });
  }

  hasPermission(supplierId: number, permission: Permission): boolean {
    const supplierPerm = this.supplierPermissions.find(sp => sp.supplier.id === supplierId);
    return supplierPerm?.permissions.has(permission) || false;
  }

  private isPendingAdd(supplierId: number, permission: Permission): boolean {
    return this.permissionsToAdd.some(p => p.supplierId === supplierId && p.permission === permission);
  }

  private isPendingRemove(supplierId: number, permission: Permission): boolean {
    return this.permissionsToRemove.some(p => p.supplierId === supplierId && p.permission === permission);
  }

  togglePermission(supplierId: number, permission: Permission) {
    const supplierPerm = this.supplierPermissions.find(sp => sp.supplier.id === supplierId);
    if (!supplierPerm) return;
    const hasPerm = supplierPerm.permissions.has(permission);
    if (hasPerm) {
      supplierPerm.permissions.delete(permission);
      this.permissionsToAdd = this.permissionsToAdd.filter(p => !(p.supplierId === supplierId && p.permission === permission));
      if (!this.isPendingRemove(supplierId, permission)) {
        this.permissionsToRemove.push({ supplierId, permission });
      }
    } else {
      supplierPerm.permissions.add(permission);
      this.permissionsToRemove = this.permissionsToRemove.filter(p => !(p.supplierId === supplierId && p.permission === permission));
      if (!this.isPendingAdd(supplierId, permission)) {
        this.permissionsToAdd.push({ supplierId, permission });
      }
    }
    this.hasChanges = true;
  }

  addSupplierPermissions() {
    if (!this.selectedSupplierId || !this.selectedUserId) return;
    const supplierWithPerson = this.availableSuppliers.find(s => s.id === this.selectedSupplierId);
    if (!supplierWithPerson) return;
    this.hasChanges = true;
    this.supplierPermissions.push({
      supplierId: supplierWithPerson.id,
      supplier: supplierWithPerson,
      person: supplierWithPerson.person,
      permissions: new Set()
    });
    this.availableSuppliers = this.availableSuppliers.filter(s => s.id !== this.selectedSupplierId);
    this.selectedSupplierId = null;
  }

  removeSupplierPermissions(supplierId: number) {
    const supplierPerm = this.supplierPermissions.find(sp => sp.supplier.id === supplierId);
    if (!supplierPerm) return;
    const permissionsToRemove = Array.from(supplierPerm.permissions);
    this.hasChanges = true;
    for (const perm of permissionsToRemove) {
      this.permissionsToAdd = this.permissionsToAdd.filter(p => !(p.supplierId === supplierId && p.permission === perm));
      if (!this.isPendingRemove(supplierId, perm)) {
        this.permissionsToRemove.push({ supplierId, permission: perm });
      }
    }
    this.supplierPermissions = this.supplierPermissions.filter(sp => sp.supplier.id !== supplierId);
    this.availableSuppliers.push({ ...supplierPerm.supplier, person: supplierPerm.person });
  }

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
}