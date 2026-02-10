'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';

type KycSubmission = {
  id: string;
  status: string;
  docType?: string | null;
  fileUrl: string;
  fileMime: string;
  fileName: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function KycPage() {
  const [kycStatus, setKycStatus] = useState('UNVERIFIED');
  const [submission, setSubmission] = useState<KycSubmission | null>(null);
  const [docType, setDocType] = useState('passport');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isVerified = kycStatus === 'VERIFIED';
  const isRejected = kycStatus === 'REJECTED';

  const statusBadge = useMemo(() => {
    switch (kycStatus) {
      case 'VERIFIED':
        return { text: 'Verified', className: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'PENDING':
        return { text: 'Pending', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
      case 'REJECTED':
        return { text: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default:
        return { text: 'Unverified', className: 'bg-gray-500/10 text-gray-300 border-gray-500/20' };
    }
  }, [kycStatus]);

  const fetchKyc = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/user/kyc', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok) {
        setKycStatus(data.kycStatus || 'UNVERIFIED');
        setSubmission(data.submission || null);
      } else {
        setError(data.error || 'Failed to load KYC status');
      }
    } catch (err) {
      setError('Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please log in again.');
        return;
      }

      const form = new FormData();
      form.append('file', file);
      form.append('docType', docType);

      const res = await fetch('/api/user/kyc/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      setSuccess('Document uploaded. Your verification is now pending.');
      setFile(null);
      await fetchKyc();
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
        <p className="text-gray-400 text-sm">
          {isVerified ? 'Your account is verified.' : 'Upload your documents to verify your account.'}
        </p>
      </div>

      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Status</p>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusBadge.className}`}>
              {statusBadge.text}
            </span>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="animate-spin" size={16} /> Loading...
            </div>
          )}
        </div>
        {isVerified && (
          <div className="bg-[#0b1220] border border-white/10 rounded-xl p-4 text-sm text-gray-300">
            Your account is verified.
          </div>
        )}

        {submission && !isVerified && kycStatus !== 'PENDING' && (
          <div className="bg-[#0b1220] border border-white/10 rounded-xl p-4 text-sm text-gray-300 space-y-2">
            <div className="flex flex-wrap gap-2 justify-between">
              <span>Latest Submission</span>
              <span className="text-gray-500">{new Date(submission.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>Doc Type: {submission.docType || 'â€”'}</span>
              <span>Status: {submission.status}</span>
              <span>File: {submission.fileName}</span>
            </div>
            {submission.note && (
              <div className="text-red-300">Admin Note: {submission.note}</div>
            )}
          </div>
        )}

        {!isVerified && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="mt-2 w-full bg-[#0b1220] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver&apos;s License</option>
                <option value="id_card">National ID Card</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Upload Document</label>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-2 w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30"
              />
              <p className="text-xs text-gray-500 mt-2">Accepted: JPG, PNG, PDF. Max 5MB.</p>
              {isRejected && (
                <p className="text-xs text-red-400 mt-2">Rejected. Please upload a new document.</p>
              )}
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-400">{error}</div>}
        {success && <div className="text-sm text-green-400">{success}</div>}
        {!isVerified && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            Upload Document
          </button>
        )}
      </div>
    </div>
  );
}


