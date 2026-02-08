'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your browser console for debugging
    console.error('Admin Panel Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0b1220] flex flex-col items-center justify-center p-4">
      <div className="bg-[#1a1f2e] border border-red-500/30 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
        <p className="text-gray-400 mb-6 text-sm">
          {error.message || "We couldn't load the admin data. Your session might have expired."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link 
            href="/admin/login"
            className="flex items-center justify-center gap-2 w-full bg-transparent border border-white/10 hover:bg-white/5 text-white font-medium py-3 px-4 rounded-xl transition-all"
          >
            Return to Login
          </Link>
        </div>

      </div>
    </div>
  );
}