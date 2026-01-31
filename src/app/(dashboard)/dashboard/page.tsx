'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [tokenStatus, setTokenStatus] = useState('Checking...');

  const addLog = (msg: string) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  useEffect(() => {
    const runDiagnostics = async () => {
      addLog("Starting Dashboard Diagnostics...");

      // 1. Check LocalStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setTokenStatus("❌ MISSING");
        addLog("CRITICAL: No token found in LocalStorage.");
        // We do NOT redirect, so you can read this message.
        return;
      } else {
        setTokenStatus("✅ PRESENT");
        addLog(`Token found: ${token.substring(0, 10)}...`);
      }

      // 2. Test API Connection
      try {
        addLog("Attempting to fetch /api/user/dashboard...");
        const res = await fetch('/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });

        addLog(`API Response Status: ${res.status}`);

        if (res.status === 200) {
          const json = await res.json();
          addLog("✅ API Success! Data received.");
          addLog(`User: ${json.user?.email}`);
          addLog(`Balance: ${json.balance}`);
        } else if (res.status === 401) {
          addLog("❌ API Error 401: Unauthorized.");
          addLog("POSSIBLE CAUSE: JWT_SECRET mismatch or missing on Vercel.");
        } else {
          addLog(`❌ API Error: ${res.statusText}`);
        }
      } catch (err: any) {
        addLog(`❌ NETWORK ERROR: ${err.message}`);
      }
    };

    runDiagnostics();
  }, []);

  return (
    <div className="p-8 text-white font-mono space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-red-400">⚠️ DEBUG MODE</h1>
      
      <div className="bg-black/40 p-4 rounded border border-white/20">
        <h2 className="text-gray-400 text-sm uppercase mb-2">Token Status</h2>
        <div className="text-xl font-bold">{tokenStatus}</div>
      </div>

      <div className="bg-black/80 p-4 rounded border border-red-500/50 h-96 overflow-y-auto">
        <h2 className="text-gray-400 text-sm uppercase mb-2">System Logs</h2>
        {debugLog.map((log, i) => (
          <div key={i} className="border-b border-white/5 py-1 text-sm text-green-400">
            {log}
          </div>
        ))}
      </div>

      <div className="pt-4 flex gap-4">
        <Link href="/auth/login" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">
          Back to Login
        </Link>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          Refresh Page
        </button>
      </div>
    </div>
  );
}