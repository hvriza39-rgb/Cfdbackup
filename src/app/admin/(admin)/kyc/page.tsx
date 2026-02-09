'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

type Submission = {
  id: string;
  status: string;
  docType?: string | null;
  fileUrl: string;
  fileMime: string;
  fileName: string;
  note?: string | null;
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
};

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/admin/kyc/submissions?status=PENDING', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(Array.isArray(data.submissions) ? data.submissions : []);
      } else {
        setError(data.error || 'Failed to load submissions');
      }
    } catch {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateSubmission = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      setError('');
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`/api/admin/kyc/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          note: notes[id] || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update submission');
        return;
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError('Failed to update submission');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const renderedRows = (() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="p-8 text-center text-gray-500">
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" size={20} /> Loading submissions...
            </div>
          </td>
        </tr>
      );
    }

    if (submissions.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="p-8 text-center text-gray-500">No pending KYC submissions.</td>
        </tr>
      );
    }

    return submissions.map((submission) => (
      <tr key={submission.id} className="hover:bg-white/5 transition-colors">
        <td className="p-4">
          <div className="font-medium text-white">{submission.user.name || 'User'}</div>
          <div className="text-xs text-gray-500">{submission.user.email}</div>
        </td>
        <td className="p-4 text-sm text-gray-300">{submission.docType || '—'}</td>
        <td className="p-4 text-sm text-gray-300">
          {new Date(submission.createdAt).toLocaleString()}
        </td>
        <td className="p-4">
          {submission.fileMime.startsWith('image/') ? (
            <Image
              src={submission.fileUrl}
              alt={submission.fileName}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg object-cover border border-white/10"
            />
          ) : (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              View File <ExternalLink size={14} />
            </a>
          )}
        </td>
        <td className="p-4">
          <input
            type="text"
            placeholder="Optional note"
            value={notes[submission.id] || ''}
            onChange={(e) => setNotes((prev) => ({ ...prev, [submission.id]: e.target.value }))}
            className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </td>
        <td className="p-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600/20 text-green-300 hover:bg-green-600/30"
              onClick={() => updateSubmission(submission.id, 'APPROVE')}
              disabled={actionLoading[submission.id]}
            >
              {actionLoading[submission.id] ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
              Approve
            </button>
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/20 text-red-300 hover:bg-red-600/30"
              onClick={() => updateSubmission(submission.id, 'REJECT')}
              disabled={actionLoading[submission.id]}
            >
              {actionLoading[submission.id] ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
              Reject
            </button>
          </div>
        </td>
      </tr>
    ));
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">KYC Submissions</h1>
          <p className="text-gray-400 text-sm">Review and approve pending verification requests.</p>
        </div>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black/20 text-gray-400 text-xs uppercase font-semibold border-b border-white/10">
                <th className="p-4">User</th>
                <th className="p-4">Doc Type</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Preview</th>
                <th className="p-4">Note</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">{renderedRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
