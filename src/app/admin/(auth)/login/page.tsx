'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import InlineAlert from '../../../../components/ui/InlineAlert';

function LoginForm() {
  const sp = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetStatus(null);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Login failed');
      }

      if (!data.success) {
        throw new Error('Login failed');
      }

      localStorage.setItem('adminEmail', email);
      window.location.href = '/admin/users';

    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    const confirmed = confirm('Reset admin password to default credentials?');
    if (!confirmed) return;

    setResetting(true);
    setError(null);
    setResetStatus(null);

    try {
      const res = await fetch('/api/admin/reset-credentials', { method: 'POST' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Reset failed');
      }

      setResetStatus('Password reset successfully. Login with your default credentials.');
    } catch (err: any) {
      setError(err?.message || 'Reset failed');
    } finally {
      setResetting(false);
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
          {resetStatus && <InlineAlert variant="success">{resetStatus}</InlineAlert>}

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

          <Button type="submit" className="w-full" loading={loading} disabled={loading || resetting}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting || loading}
              className="text-sm text-muted underline hover:text-foreground disabled:opacity-50"
            >
              {resetting ? 'Resetting...' : 'Forgot password? Reset to default'}
            </button>
          </div>
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
