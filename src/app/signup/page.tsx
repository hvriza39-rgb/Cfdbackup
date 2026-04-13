'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast'; // Optional: Use toast if you have it installed
import { Loader2 } from 'lucide-react'; // Optional: For icons

export default function SignupPage() {
  const router = useRouter();
  
  // 1. Added 'phone' and 'country' to state
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    phone: '',
    country: '' 
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 2. Correct URL matches your folder name 'register'
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Success! Redirect to login
        router.push('/auth/login'); // Ensure this path matches your login page location
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center p-4">
      {/* Optional Toaster */}
      <Toaster position="top-center" />

      <div className="w-full max-w-md bg-[#1a1f2e] border border-white/10 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join CFDTRADE today</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Full Name</label>
            <input 
              name="name"
              type="text" 
              required
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Email Address</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Phone & Country Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1">Phone</label>
              <input 
                name="phone"
                type="tel" 
                placeholder="+1 234..."
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 ml-1">Country</label>
              <input 
                name="country"
                type="text" 
                placeholder="USA"
                value={form.country}
                onChange={handleChange}
                className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-2 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
