export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AccountStatus = 'active' | 'suspended' | 'closed';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  balance: number;
  kycStatus: KycStatus;
  accountStatus: AccountStatus;
  createdAt: string; // ISO
}
