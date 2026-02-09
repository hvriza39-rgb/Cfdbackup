import { User } from '../../types/user';
import { AdminProfile, BrokerSettings } from '../../types/admin';

let users: User[] = [
  {
    id: 'u_1',
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+2348012345678',
    country: 'NG',
    balance: 12500.45,
    kycStatus: 'VERIFIED',
    accountStatus: 'active',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'u_2',
    fullName: 'Satoshi Nakamoto',
    email: 'satoshi@example.com',
    phone: '+1-555-000-1111',
    country: 'US',
    balance: 0,
    kycStatus: 'PENDING',
    accountStatus: 'suspended',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

let brokerSettings: BrokerSettings = {
  depositWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  updatedAt: new Date().toISOString(),
  updatedBy: 'admin_1',
};

export const mockAdmin: AdminProfile = {
  id: 'admin_1',
  email: 'admin@broker.com',
  role: 'superadmin',
  name: 'Emmanuel',
};

export function mockLogin(email: string, password: string) {
  if (email === 'admin@broker.com' && password === 'Admin123!') {
    return {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      admin: mockAdmin,
    };
  }
  throw new Error('Invalid credentials');
}

export function mockGetMe() {
  return mockAdmin;
}

export function mockListUsers(query?: { search?: string; status?: string; kyc?: string }): User[] {
  let result = [...users];

  if (query?.search) {
    const s = query.search.toLowerCase();
    result = result.filter(
      (u) =>
        u.email.toLowerCase().includes(s) ||
        (u.phone || '').toLowerCase().includes(s) ||
        u.fullName.toLowerCase().includes(s),
    );
  }

  if (query?.status) {
    result = result.filter((u) => u.accountStatus === query.status);
  }

  if (query?.kyc) {
    result = result.filter((u) => u.kycStatus === query.kyc);
  }

  return result;
}

export function mockGetUser(id: string): User | null {
  return users.find((u) => u.id === id) || null;
}

export function mockUpdateUser(id: string, patch: Partial<User>): User {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...patch };
  return users[idx];
}

export function mockUpdateUserBalance(id: string, operation: 'add' | 'subtract', amount: number): User {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('User not found');

  const currentBalance = users[idx].balance;
  let newBalance: number;

  if (operation === 'add') {
    newBalance = currentBalance + amount;
  } else {
    newBalance = currentBalance - amount;
    if (newBalance < 0) throw new Error('Insufficient balance');
  }

  users[idx] = { ...users[idx], balance: newBalance };
  return users[idx];
}

export function mockResetPassword(id: string) {
  const user = mockGetUser(id);
  if (!user) throw new Error('User not found');
  return { success: true };
}

export function mockGetBrokerSettings(): BrokerSettings {
  return brokerSettings;
}

export function mockUpdateBrokerSettings(depositWallet: string, adminId: string): BrokerSettings {
  brokerSettings = {
    depositWallet,
    updatedAt: new Date().toISOString(),
    updatedBy: adminId,
  };
  return brokerSettings;
}
