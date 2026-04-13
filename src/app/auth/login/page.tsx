'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import Logo from '../../../components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Send Login Request
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN DEBUG:", data); 

      if (res.ok && data.token) {
        // 2. ✅ CRITICAL: Save Token & User Info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 3. Verify it was saved (Double Check)
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
          throw new Error("Browser failed to save token");
        }

        // 4. Redirect ONLY after confirming save
        console.log("Token saved successfully. Redirecting...");
        window.location.href = '/dashboard'; // Force full reload to ensure state picks up
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1221] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1f2e] p-8 rounded-2xl border border-white/10 shadow-xl">
        
        <div className="text-center mb-8">
  <Link href="/" className="flex justify-center mb-4">
  <Logo className="justify-center" />
</Link 
  <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
  <p className="text-gray-400 text-sm">Sign in to access your portfolio</p>
</div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f1522] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f1522] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
