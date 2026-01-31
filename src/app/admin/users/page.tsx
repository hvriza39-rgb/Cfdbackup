'use client';

import { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

// Icons (Optional: you can remove these imports if you don't have lucide-react)
import { User, Wallet, MessageSquare, X, CheckCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'wallet' | 'message'>('details');
  
  // Wallet Form State
  const [amount, setAmount] = useState('');
  
  // Message Form State
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');

  // Status Feedback (No more alerts!)
  const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch Users
  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      const userList = Array.isArray(data) ? data : (data.users || []);
      setUsers(userList);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ NEW: Fetch single user with fresh data from database
  async function fetchSingleUser(userId: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || data;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      return null;
    }
  }

  // ✅ NEW: Open modal with fresh user data
  async function openUserModal(user: any) {
    setSelectedUser(user); // Set immediately for responsive UI
    setActiveTab('details');
    
    // Fetch fresh data in background
    const freshUser = await fetchSingleUser(user.id);
    if (freshUser) {
      setSelectedUser(freshUser);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  // Clear status after 3 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // 1. Handle Wallet Update
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

      // ✅ Update modal with fresh data from server
      if (data.user) {
        setSelectedUser(data.user);
      } else {
        // Fallback: Fetch fresh user data if not returned
        const freshUser = await fetchSingleUser(selectedUser.id);
        if (freshUser) {
          setSelectedUser(freshUser);
        }
      }

      setStatus({ type: 'success', text: `Successfully ${operation === 'add' ? 'added' : 'deducted'} $${amount}` });
      setAmount('');
      
      // Refresh the users list in background
      fetchUsers();
    } catch (error: any) {
      setStatus({ type: 'error', text: error.message || 'Failed to update balance' });
    } finally {
      setProcessing(false);
    }
  }

  // 2. Handle Send Message
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

      if (!res.ok) throw new Error('Failed to send');

      setStatus({ type: 'success', text: 'Message sent to user dashboard.' });
      setMsgTitle('');
      setMsgBody('');
    } catch (error) {
      setStatus({ type: 'error', text: 'Could not send message.' });
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="p-6 text-white">Loading users...</div>;

  return (
    <div className="p-6 relative min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
      
      {/* User List */}
      <div className="grid gap-4">
        {users.map((user) => (
            <Card key={user.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-lg">{user.name || 'Unnamed'}</p>
                  <span className={`px-2 py-0.5 rounded text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              
              {/* ✅ FIXED: Now fetches fresh data when opening modal */}
              <Button onClick={() => openUserModal(user)} className="bg-gray-700 hover:bg-gray-600">
                Manage User
              </Button>
            </Card>
        ))}
      </div>

      {/* MASTER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-1/3 bg-white/5 p-4 flex flex-col gap-2 border-r border-white/10">
              <div className="mb-6">
                <h2 className="font-bold text-white truncate">{selectedUser.name}</h2>
                <p className="text-xs text-gray-400 truncate">{selectedUser.email}</p>
              </div>
              
              <button onClick={() => setActiveTab('details')} className={`p-3 rounded-lg text-left text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                User Details
              </button>
              <button onClick={() => setActiveTab('wallet')} className={`p-3 rounded-lg text-left text-sm font-medium transition-colors ${activeTab === 'wallet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                Wallet & Balance
              </button>
              <button onClick={() => setActiveTab('message')} className={`p-3 rounded-lg text-left text-sm font-medium transition-colors ${activeTab === 'message' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                Send Message
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 relative bg-[#1a1f2e] overflow-y-auto">
              {/* Close Button */}
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                ✕
              </button>

              {/* Status Message */}
              {status && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {status.text}
                </div>
              )}

              {/* TAB 1: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Profile Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="text-sm text-gray-300 font-mono truncate">{selectedUser.id}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-500">Role</p>
                      <p className="text-sm text-gray-300 capitalize">{selectedUser.role}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg col-span-2">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-300">{selectedUser.email}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg col-span-2">
                      <p className="text-xs text-gray-500">Current Balance</p>
                      <p className="text-2xl font-bold text-green-400">${selectedUser.portfolioBalance?.toLocaleString() || '0.00'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WALLET */}
              {activeTab === 'wallet' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Adjust Wallet Balance</h3>
                  
                  <div className="p-4 bg-black/20 rounded-xl mb-6">
                     <p className="text-sm text-gray-400 mb-1">Current Balance</p>
                     <p className="text-3xl font-bold text-white">${selectedUser.portfolioBalance?.toLocaleString() || '0'}</p>
                  </div>

                  <Input 
                    label="Amount ($)" 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00"
                  />
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button onClick={() => handleBalanceUpdate('add')} disabled={processing} className="bg-green-600 hover:bg-green-500">
                      + Deposit
                    </Button>
                    <Button onClick={() => handleBalanceUpdate('subtract')} disabled={processing} className="bg-red-600 hover:bg-red-500">
                      - Withdraw
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 3: MESSAGES */}
              {activeTab === 'message' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Send Notification</h3>
                  <p className="text-sm text-gray-400">This message will appear in the user's dashboard.</p>
                  
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <Input 
                      label="Title / Subject" 
                      value={msgTitle} 
                      onChange={(e) => setMsgTitle(e.target.value)} 
                      placeholder="e.g. Deposit Confirmation"
                    />
                    
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Message Body</label>
                      <textarea 
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[120px]"
                        value={msgBody}
                        onChange={(e) => setMsgBody(e.target.value)}
                        placeholder="Type your message here..."
                      />
                    </div>

                    <Button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-500">
                      {processing ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}