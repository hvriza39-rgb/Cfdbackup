'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, User, Mail } from 'lucide-react';

export default function ComposeMessagePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Form State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  // Status State
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 1. Fetch Users (Only to populate the dropdown)
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        const data = await res.json();
        // Handle array or object response structure
        const userList = Array.isArray(data) ? data : (data.users || []);
        setUsers(userList);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // 2. Handle Send
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) {
        setStatus({ type: 'error', text: 'Please select a user first.' });
        return;
    }
    
    setIsSending(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: selectedUserId,
            subject,
            body
        }),
      });

      if (res.ok) {
        setStatus({ type: 'success', text: 'Message sent successfully!' });
        setSubject('');
        setBody('');
        setSelectedUserId(''); // Reset selection
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Server error. Could not send message.' });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Compose Message</h1>
        <p className="text-gray-400">Send secure notifications directly to a user's dashboard.</p>
      </div>

      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        
        {/* Status Alert */}
        {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="font-bold">{status.text}</span>
            </div>
        )}

        <form onSubmit={handleSendMessage} className="space-y-6">
            
            {/* User Dropdown */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <User size={16} /> Recipient
                </label>
                <div className="relative">
                    <select 
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none appearance-none cursor-pointer hover:border-white/20 transition-colors"
                        required
                    >
                        <option value="" disabled>-- Select a User --</option>
                        {loadingUsers ? (
                            <option>Loading users...</option>
                        ) : (
                            users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.email} {user.name ? `(${user.name})` : ''}
                                </option>
                            ))
                        )}
                    </select>
                    {/* Custom Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        ▼
                    </div>
                </div>
            </div>

            {/* Subject Line */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <Mail size={16} /> Subject
                </label>
                <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Important Account Update"
                    className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors"
                    required
                />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                    Message Body
                </label>
                <textarea 
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none min-h-[200px] resize-y transition-colors"
                    required
                />
            </div>

            {/* Send Button */}
            <button 
                type="submit" 
                disabled={isSending || loadingUsers}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isSending 
                    ? 'bg-blue-800 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                }`}
            >
                {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {isSending ? 'Sending...' : 'Send Message'}
            </button>

        </form>
      </div>
    </div>
  );
}