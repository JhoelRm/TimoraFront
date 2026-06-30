
export type CompanyStatus = 'ACTIVE' | 'INACTIVE';

export interface CompanyDTO {
  id: number;
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  status: CompanyStatus;
}

export interface CompanyCreateDTO {
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
}

export interface CompanyPatchDTO {
  name?: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
}