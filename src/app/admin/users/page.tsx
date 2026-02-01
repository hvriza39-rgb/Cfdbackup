'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Wallet, 
  MessageSquare, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Search,
  Save,
  RotateCcw
} from 'lucide-react';

// Data Types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  portfolioBalance: number;
  verified: boolean;
  status: string;
  phone?: string;
  country?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'wallet' | 'message'>('details');
  
  // Forms
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', country: '', status: 'active', verified: false });
  const [amount, setAmount] = useState('');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');

  // Status Feedback
  const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [processing, setProcessing] = useState(false);

  // 1. Fetch Users (Added cache: 'no-store' to fix stale data)
  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      // Handle different API response structures safely
      const userList = Array.isArray(data) ? data : (data.users || []);
      setUsers(userList);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  // 2. Fetch Single User (Get fresh data from server)
  async function fetchSingleUser(userId: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || data;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      return null;
    }
  }

  // Open Modal
  async function openUserModal(user: UserData) {
    setSelectedUser(user);
    setActiveTab('details');
    setStatus(null);
    
    // Init Edit Form
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      country: user.country || '',
      status: user.status || 'active',
      verified: user.verified || false
    });

    // Background refresh to get absolute latest data
    const freshData = await fetchSingleUser(user.id);
    if (freshData) {
        setSelectedUser(freshData);
        setEditForm({
            name: freshData.name || '',
            email: freshData.email || '',
            phone: freshData.phone || '',
            country: freshData.country || '',
            status: freshData.status || 'active',
            verified: freshData.verified || false
        });
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  // Filter
  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Auto-clear status
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // --- ACTIONS ---

  // 1. Update Profile
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setProcessing(true);
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Update failed');
      
      setStatus({ type: 'success', text: 'Profile updated!' });
      // Refresh both list and modal
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to update.' });
    } finally {
      setProcessing(false);
    }
  }

  // 2. Balance Update (FIXED LOGIC)
  async function handleBalanceUpdate(operation: 'add' | 'subtract') {
    if (!selectedUser || !amount) return;
    setProcessing(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, amount: parseFloat(amount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      // ✅ FIX: Force update the UI state immediately
      let newBalance = selectedUser.portfolioBalance;
      
      // If server returns the new balance, use it. 
      if (data.newBalance !== undefined) {
         newBalance = Number(data.newBalance);
      } else if (data.user && data.user.portfolioBalance !== undefined) {
         newBalance = Number(data.user.portfolioBalance);
      } else {
         // Fallback: Calculate locally if server didn't send back the number
         const change = parseFloat(amount);
         newBalance = operation === 'add' ? newBalance + change : newBalance - change;
      }

      // Update Modal State
      setSelectedUser(prev => prev ? ({ ...prev, portfolioBalance: newBalance }) : null);
      
      // Update List State (so background table updates too)
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === selectedUser.id ? { ...u, portfolioBalance: newBalance } : u
      ));

      setStatus({ type: 'success', text: `Successfully ${operation === 'add' ? 'added' : 'deducted'} $${amount}` });
      setAmount('');
      
    } catch (error: any) {
      setStatus({ type: 'error', text: error.message || 'Failed' });
    } finally {
      setProcessing(false);
    }
  }

  // 3. Send Message
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !msgBody) return;
    setProcessing(true);
    
    try {
      const res = await fetch(`/api/admin/users/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, title: msgTitle, message: msgBody }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus({ type: 'success', text: 'Message sent!' });
      setMsgTitle(''); setMsgBody('');
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to send message.' });
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="p-8 text-white flex items-center gap-2"><Loader2 className="animate-spin"/> Loading users...</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Total Users: {users.length}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1a1f2e] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 w-full md:w-80 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Status</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.name || 'Unnamed'}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.verified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {user.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="p-4 text-white font-mono">${user.portfolioBalance?.toLocaleString()}</td>
                  <td className="p-4 text-gray-300 capitalize">{user.role}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openUserModal(user)} className="text-blue-400 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[550px]">
            
            {/* Sidebar */}
            <div className="w-full md:w-1/3 bg-[#0b1221] p-4 flex flex-col gap-2 border-r border-white/10">
              <div className="mb-6 pt-2 text-center md:text-left">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-lg mx-auto md:mx-0">
                   {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 className="font-bold text-white truncate text-lg">{selectedUser.name}</h2>
                <p className="text-xs text-gray-400 truncate">{selectedUser.email}</p>
              </div>
              
              <button onClick={() => setActiveTab('details')} className={`w-full p-3 rounded-xl text-left text-sm font-medium flex gap-3 ${activeTab === 'details' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <User size={18} /> Edit Profile
              </button>
              <button onClick={() => setActiveTab('wallet')} className={`w-full p-3 rounded-xl text-left text-sm font-medium flex gap-3 ${activeTab === 'wallet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <Wallet size={18} /> Wallet Balance
              </button>
              <button onClick={() => setActiveTab('message')} className={`w-full p-3 rounded-xl text-left text-sm font-medium flex gap-3 ${activeTab === 'message' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                <MessageSquare size={18} /> Send Message
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 relative bg-[#1a1f2e] overflow-y-auto">
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"><X size={24} /></button>

              {status && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 border ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  {status.text}
                </div>
              )}

              {/* EDIT DETAILS */}
              {activeTab === 'details' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                  <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Edit User Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs text-gray-400 uppercase font-bold">Full Name</label>
                       <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#0b1221] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-gray-400 uppercase font-bold">Email</label>
                       <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-[#0b1221] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-gray-400 uppercase font-bold">Phone</label>
                       <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-[#0b1221] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-gray-400 uppercase font-bold">Country</label>
                       <input type="text" value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} className="w-full bg-[#0b1221] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-gray-400 uppercase font-bold">Status</label>
                       <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full bg-[#0b1221] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500">
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs text-gray-400 uppercase font-bold">KYC</label>
                       <select value={editForm.verified ? 'true' : 'false'} onChange={e => setEditForm({...editForm, verified: e.target.value === 'true'})} className="w-full bg-[#0b1221] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500">
                          <option value="true">Verified</option>
                          <option value="false">Unverified</option>
                       </select>
                    </div>
                  </div>
                  <button type="submit" disabled={processing} className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex justify-center items-center gap-2">
                    {processing ? <Loader2 className="animate-spin w-4 h-4"/> : <><Save size={18} /> Save Changes</>}
                  </button>
                </form>
              )}

              {/* WALLET */}
              {activeTab === 'wallet' && (
                <div className="space-y-6 pt-2">
                  <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Manage Funds</h3>
                  <div className="p-4 bg-[#0b1221] rounded-xl border border-white/10 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center"><Wallet size={24} /></div>
                     <div>
                        <p className="text-sm text-gray-400">Current Balance</p>
                        <p className="text-2xl font-bold text-white font-mono">${selectedUser.portfolioBalance?.toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#0b1221] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white text-lg font-mono outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleBalanceUpdate('add')} disabled={processing || !amount} className="py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white">Add Funds</button>
                    <button onClick={() => handleBalanceUpdate('subtract')} disabled={processing || !amount} className="py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white">Deduct Funds</button>
                  </div>
                </div>
              )}

              {/* MESSAGE */}
              {activeTab === 'message' && (
                <form onSubmit={handleSendMessage} className="space-y-4 pt-2">
                  <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Send Notification</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Subject</label>
                    <input type="text" value={msgTitle} onChange={(e) => setMsgTitle(e.target.value)} className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Message</label>
                    <textarea value={msgBody} onChange={(e) => setMsgBody(e.target.value)} className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-3 text-white min-h-[120px] outline-none focus:border-blue-500" />
                  </div>
                  <button type="submit" disabled={processing} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white">Send Notification</button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}