'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, LifeBuoy, Loader2, Plus, Send, XCircle } from 'lucide-react';

type SupportMessage = {
  id: string;
  sender: 'USER' | 'ADMIN';
  body: string;
  createdAt: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  status: 'OPEN' | 'CLOSED';
  priority?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
};

const statusStyles: Record<string, string> = {
  OPEN: 'bg-green-500/10 text-green-300 border-green-500/30',
  CLOSED: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) || null,
    [tickets, selectedId],
  );

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please log in again.');
        return;
      }
      const res = await fetch('/api/user/support/tickets', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to load tickets.');
        return;
      }
      setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
      setError('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDetailError('Session expired. Please log in again.');
        return;
      }
      const res = await fetch(`/api/user/support/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDetailError(data.error || 'Failed to load ticket.');
        return;
      }
      const ticket = data?.ticket as SupportTicket | undefined;
      if (!ticket) {
        setDetailError('Ticket not found.');
        return;
      }
      setTickets((prev) => prev.map((item) => (item.id === ticket.id ? ticket : item)));
    } catch (err) {
      setDetailError('Network error. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    fetchTicketDetail(id);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCreate = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Please enter a subject and message.');
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please log in again.');
        return;
      }
      const res = await fetch('/api/user/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to create ticket.');
        return;
      }
      const ticket = data?.ticket as SupportTicket | undefined;
      if (ticket) {
        setTickets((prev) => [ticket, ...prev]);
        setSelectedId(ticket.id);
      }
      setSubject('');
      setBody('');
      setShowNew(false);
      setError('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || selectedTicket.status === 'CLOSED') return;
    if (!reply.trim()) {
      setDetailError('Please enter a reply.');
      return;
    }
    setReplying(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDetailError('Session expired. Please log in again.');
        return;
      }
      const res = await fetch(`/api/user/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDetailError(data.error || 'Failed to send reply.');
        return;
      }
      setReply('');
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets();
    } catch (err) {
      setDetailError('Network error. Please try again.');
    } finally {
      setReplying(false);
    }
  };

  const handleClose = async () => {
    if (!selectedTicket || selectedTicket.status === 'CLOSED') return;
    setDetailError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDetailError('Session expired. Please log in again.');
        return;
      }
      const res = await fetch(`/api/user/support/tickets/${selectedTicket.id}/close`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDetailError(data.error || 'Failed to close ticket.');
        return;
      }
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets();
    } catch (err) {
      setDetailError('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Support</h1>
          <p className="text-gray-400">Create a ticket and keep track of replies.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew((prev) => !prev)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {showNew && (
        <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">New Support Request</h2>
            <button type="button" onClick={() => setShowNew(false)} className="text-gray-400 hover:text-white">
              <XCircle size={20} />
            </button>
          </div>
          <div>
            <label className="text-xs text-gray-400">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 w-full bg-[#0b1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Account access issue"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="mt-2 w-full bg-[#0b1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Describe your issue..."
            />
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <button
            type="button"
            onClick={handleCreate}
            disabled={sending}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {sending ? <Loader2 className="animate-spin" size={16} /> : <LifeBuoy size={16} />}
            Submit Ticket
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#1a1f2e] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Tickets</h2>
            {loading && <Loader2 className="animate-spin text-gray-400" size={16} />}
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          {!loading && tickets.length === 0 && !error && (
            <div className="text-sm text-gray-400">No tickets yet.</div>
          )}
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const lastMessage = ticket.messages?.[ticket.messages.length - 1];
              const isExpanded = expandedId === ticket.id;
              const isActive = selectedId === ticket.id;
              return (
                <div
                  key={ticket.id}
                  className={`border rounded-xl p-3 transition-colors ${
                    isActive ? 'border-blue-500/60 bg-blue-500/10' : 'border-white/10 bg-[#0b1220]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(ticket.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                        <p className="text-xs text-gray-500">
                          Updated {new Date(ticket.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold uppercase border rounded-full px-2 py-0.5 ${statusStyles[ticket.status]}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleExpand(ticket.id)}
                    className="mt-2 text-xs text-gray-400 flex items-center gap-2 hover:text-white"
                  >
                    Details
                    <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={14} />
                  </button>
                  {isExpanded && (
                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                      <div>Created {new Date(ticket.createdAt).toLocaleString()}</div>
                      {lastMessage && (
                        <div className="text-gray-300 line-clamp-2">
                          Last: {lastMessage.body}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 shadow-xl">
          {!selectedTicket ? (
            <div className="text-sm text-gray-400">Select a ticket to view the conversation.</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedTicket.subject}</h2>
                  <p className="text-xs text-gray-500">
                    Ticket opened {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold uppercase border rounded-full px-3 py-1 ${statusStyles[selectedTicket.status]}`}
                  >
                    {selectedTicket.status}
                  </span>
                  {selectedTicket.status === 'OPEN' && (
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-xs text-red-300 hover:text-red-200 border border-red-500/40 px-3 py-1 rounded-full"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>

              {detailLoading && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="animate-spin" size={16} /> Loading conversation...
                </div>
              )}
              {detailError && <div className="text-sm text-red-400">{detailError}</div>}
              <div className="space-y-4">
                {selectedTicket.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.sender === 'USER'
                          ? 'bg-blue-600/30 text-white border border-blue-500/40'
                          : 'bg-[#0b1220] text-gray-200 border border-white/10'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                        {message.sender === 'USER' ? 'You' : 'Support'}
                      </div>
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <div className="text-[10px] text-gray-500 mt-2">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status === 'CLOSED' ? (
                <div className="text-xs text-gray-400 border border-white/10 rounded-xl px-4 py-3">
                  This ticket is closed. Create a new ticket if you need more help.
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0b1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Write your reply..."
                  />
                  <button
                    type="button"
                    onClick={handleReply}
                    disabled={replying}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {replying ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    Send Reply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
