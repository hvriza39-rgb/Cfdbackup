'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: ''
  });

  // 1. Fetch Real Data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      
      // 🚨 FIX: If no token, Redirect to Login!
      if (!token) {
        router.push('/auth/login'); 
        return;
      }

      try {
        const res = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            country: data.country || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // ✅ Ensure loading stops
      }
    };

    fetchProfile();
  }, [router]);

  // 2. Handle Save
  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          country: formData.country
        })
      });

      if (res.ok) {
        setMessage('Success! Profile updated.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage('Failed to update.');
      }
    } catch (err) {
      setMessage('Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-10">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto text-white space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      {message && (
        <div className={`p-4 rounded-xl ${message.includes('Success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message}
        </div>
      )}

      <div className="bg-[#1a1f2e] border border-white/10 p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{formData.name || 'User'}</h2>
            <p className="text-gray-400 text-sm">{formData.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#0b1220] border border-white/10 p-3 rounded-xl focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Email (Read Only)</label>
            <input 
              type="text" 
              value={formData.email}
              disabled
              className="w-full bg-[#0b1220]/50 border border-white/5 p-3 rounded-xl text-gray-500 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Phone</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-[#0b1220] border border-white/10 p-3 rounded-xl focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Country</label>
            <input 
              type="text" 
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full bg-[#0b1220] border border-white/10 p-3 rounded-xl focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}