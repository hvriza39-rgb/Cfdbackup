'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Loader2, Mail } from 'lucide-react';

type Message = {
  id: string;
  title?: string | null;
  body: string;
  read?: boolean;
  createdAt: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchMessages = async (silenceErrors = false) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        if (!silenceErrors) setError('Session expired. Please log in again.');
        return;
      }

      const res = await fetch('/api/user/messages', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (!silenceErrors) setError(data.error || 'Failed to load messages.');
        return;
      }

      const data = await res.json();
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      if (!silenceErrors) setError('');
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      if (!silenceErrors) setError('Network error. Please try again.');
    } finally {
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await fetchMessages();
      setLoading(false);
    };

    load();

    const interval = setInterval(() => {
      if (mounted) fetchMessages(true);
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please log in again.');
        return;
      }

      const res = await fetch('/api/user/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to update message.');
        return;
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)),
      );
      window.dispatchEvent(new Event('messages:unread-refresh'));
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
        <p className="text-gray-400">Your latest updates from the admin team.</p>
      </div>

      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Inbox</h2>
          {loading && <Loader2 className="animate-spin text-gray-400" size={18} />}
        </div>

        {error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-sm">No messages yet.</div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isRead = msg.read === true;
              return (
                <div
                  key={msg.id}
                  className={`border rounded-xl p-4 transition-colors cursor-pointer ${
                    isRead
                      ? 'border-white/10 bg-[#0b1221]'
                      : 'border-blue-500/40 bg-blue-500/5'
                  }`}
                  onClick={() => {
                    if (!isRead) markAsRead(msg.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className={isRead ? 'text-gray-500' : 'text-blue-400'} />
                      <h3 className={`font-semibold ${isRead ? 'text-white' : 'text-blue-100'}`}>
                        {msg.title || 'Message'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {isRead && (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <CheckCircle size={12} /> Read
                        </span>
                      )}
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mt-2 leading-relaxed">{msg.body}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
