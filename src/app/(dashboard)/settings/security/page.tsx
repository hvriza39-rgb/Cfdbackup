'use client';

// OPTION 2: Use these dots instead of the @ symbol
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Input from '../../../../components/ui/Input';
import Table from '../../../../components/ui/Table';
import { devices, loginActivity } from '../../../../data/mockData';
import { useMemo, useState } from 'react';

export default function SecuritySettingsPage() {
  const [twoFA, setTwoFA] = useState(false);

  // Generate fake recovery codes for the UI demo
  const recoveryCodes = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const rnd = Math.floor(Math.random() * 9000) + 1000;
      return `RC-${1000 + i}-${rnd}`;
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Password Section */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Current password" type="password" />
          <Input label="New password" type="password" />
          <Input label="Confirm new password" type="password" />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => alert('Password updated (demo)')}>
            Update password
          </Button>
        </div>
      </Card>

      {/* 2FA Section */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="accent-blue-500 w-4 h-4"
            checked={twoFA} 
            onChange={e => setTwoFA(e.target.checked)} 
          />
          <span className="text-gray-300">Enable 2FA (UI only)</span>
        </label>
        
        {twoFA && (
          <div className="rounded-md bg-white/5 border border-white/10 p-4 text-sm animate-in fade-in slide-in-from-top-2">
            <p className="text-gray-400 mb-2">Save these recovery codes in a safe place:</p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {recoveryCodes.map(code => (
                <li key={code} className="rounded bg-black/40 px-3 py-1.5 text-center font-mono text-blue-400 border border-white/5">
                  {code}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device History */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Devices & Sessions</h3>
          <Table headers={['Device', 'Location', 'Last Active']}>
            {devices.map(d => (
              <tr key={d.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white">{d.device}</td>
                <td className="px-4 py-3 text-gray-400">{d.location}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{d.lastActive}</td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* Login Activity */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Login Activity</h3>
          <Table headers={['Time', 'IP', 'Status']}>
            {loginActivity.map(l => (
              <tr key={l.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-gray-400">{l.time}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.ip}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    l.status === 'Success' 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
} 
