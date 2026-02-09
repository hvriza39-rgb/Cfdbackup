'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import InlineAlert from '../../../../components/ui/InlineAlert';

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get('redirect') || '/admin/users';

  // ✅ FIXED: No more hardcoded credentials!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // We use the standard auth route we fixed earlier
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Login failed');
      }

      if (!data.token) {
        throw new Error("Server error: No token received.");
      }
      
      // 1. Save Token + User Info
      document.cookie = `token=${data.token}; path=/; max-age=3600; SameSite=Lax`;
      localStorage.setItem('token', data.token); // Backup for client-side checks
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // 2. Smart Redirect based on Role
      // If the user is an admin, send them to the users list
      // If they are a regular user, send them to the main dashboard
      const target = data.user?.role === 'admin' ? '/admin/users' : '/dashboard';
      
      // 3. Force navigation (bypass cache)
      window.location.href = target;

    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
          <div>
            <h1 className="text-xl font-semibold">Admin Login</h1>
            <p className="text-sm text-muted mt-1">Sign in to manage users and transactions.</p>
          </div>

          {error && <InlineAlert variant="error">{error}</InlineAlert>}

          <Input 
            label="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <Suspense fallback={<div className="text-white">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
