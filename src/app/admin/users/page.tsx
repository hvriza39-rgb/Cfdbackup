'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Edit, Trash2, Shield, ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users', {
            cache: 'no-store' 
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 2. Search Filter
  const filteredUsers = users.filter((user: any) => 
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm">Total Users: {users.length}</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Users Table Container */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        
        {/* 🚨 MOBILE FIX: This div allows horizontal scrolling */}
        <div className="overflow-x-auto">
          
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/20 text-gray-400 text-xs uppercase font-semibold border-b border-white/10">
                <th className="p-4">User</th>
                <th className="p-4">Country</th>
                <th className="p-4">Status</th>
                <th className="p-4">Wallet Balance</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No users found matching &quot;{search}&quot;</td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name || 'Unnamed User'}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="p-4 text-gray-400 text-sm">
                      {user.country || 'N/A'}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${
                        user.status === 'Verified' || user.status === 'Active'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {user.status === 'Verified' ? <Shield size={12} /> : <ShieldAlert size={12} />}
                        {user.status || 'Unverified'}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="p-4 font-mono font-medium text-white">
                      ${(user.portfolioBalance || 0).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/users/${user.id}`}
                          className="p-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </Link>
                        {/* Add Delete logic later if needed */}
                        {/* <button className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button> */}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
