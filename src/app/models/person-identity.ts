// ========================
// ENUMS (SHARED DOMAIN TYPES)
// ========================

export type Status = 'ACTIVE' | 'INACTIVE';

export type Role = 'OWNER' | 'ADMIN' | 'USER' | 'STAFF';


// ========================
// PERSON
// ========================

export interface PersonCreateDTO {
  companyId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

export interface PersonDTO {
  id: number;
  companyId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  status: Status;
}

export interface PersonPatchDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: Status;
}


// ========================
// USER
// ========================

export interface UserCreateDTO {
  companyId: number;
  email: string;
  password: string;
  role: Role;
}

export interface UserDTO {
  id: number;
  companyId: number;
  email: string;
  role: Role;
  status: Status;
  lastLoginAt: string;
  createdDate: string;
}

export interface UserPatchDTO {
  email?: string;
  role?: Role;
}


// ========================
// CUSTOMER
// ========================

export interface CustomerCreateDTO {
  companyId: number;
  personId: number;
  notes: string;
}

export interface CustomerDTO {
  id: number;
  companyId: number;
  personId: number;
  notes: string;
  createdAt: string;
}

export interface CustomerPatchDTO {
  personId?: number;
  notes?: string;
}


// ========================
// SUPPLIER
// ========================

export interface SupplierCreateDTO {
  companyId: number;
  personId: number;
  specialty: string;
  notes: string;
}

export interface SupplierDTO {
  id: number;
  companyId: number;
  personId: number;
  specialty: string;
  notes: string;
  createdAt: string;
}

export interface SupplierPatchDTO {
  personId?: number;
  specialty?: string;
  notes?: string;
}


// ========================
// PERSON IDENTITY (AGGREGATE ROOT)
// ========================

export interface PersonIdentityCreateDTO {
  person: PersonCreateDTO;
  user: UserCreateDTO;
  customer: CustomerCreateDTO;
  supplier: SupplierCreateDTO;
}

export interface PersonIdentityDTO {
  person: PersonDTO;
  user: UserDTO;
  customer: CustomerDTO;
  supplier: SupplierDTO;
}

export interface PersonIdentityPatchDTO {
  person?: PersonPatchDTO;
  user?: UserPatchDTO;
  customer?: CustomerPatchDTO;
  supplier?: SupplierPatchDTO;
}