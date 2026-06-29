export interface PersonPatchDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
}

export interface UserPatchDTO {
  email?: string;
  role?: string;
}

export interface CustomerPatchDTO {
  personId?: number;
  notes?: string;
}

export interface SupplierPatchDTO {
  personId?: number;
  specialty?: string;
  notes?: string;
}

export interface PersonIdentityPatchDTO {
  person?: PersonPatchDTO;
  user?: UserPatchDTO;
  customer?: CustomerPatchDTO;
  supplier?: SupplierPatchDTO;
}