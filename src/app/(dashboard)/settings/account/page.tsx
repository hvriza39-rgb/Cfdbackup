'use client';

// OPTION 2: Use these dots instead of the @ symbol
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import { useState, ChangeEvent } from 'react'; // Added ChangeEvent

export default function AccountSettingsPage() {
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('GMT+01:00');
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Helper to handle changes cleanly
  const handleCurrency = (e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value);
  const handleLanguage = (e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value);
  const handleTimezone = (e: ChangeEvent<HTMLSelectElement>) => setTimezone(e.target.value);

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Fixed: Added explicit handlers */}
          <Select label="Currency" value={currency} onChange={handleCurrency}>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </Select>
          
          <Select label="Language" value={language} onChange={handleLanguage}>
            <option>English</option>
            <option>French</option>
          </Select>
          
          <Select label="Timezone" value={timezone} onChange={handleTimezone}>
            <option>GMT+01:00</option>
            <option>GMT+00:00</option>
            <option>GMT+02:00</option>
          </Select>

        </div>
      </Card>

      <Card className="p-4 space-y-4 border border-red-500/40">
        <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
        <p className="text-sm text-gray-400">Closing your account is irreversible.</p>
        <Button variant="danger" onClick={() => setConfirmClose(true)}>Close account</Button>
      </Card>

      <Modal open={confirmClose} onClose={() => { setConfirmClose(false); setConfirmText(''); }} title="Confirm account closure">
        <p className="text-sm text-gray-400">Type <strong>CLOSE</strong> to confirm.</p>
        <input 
          className="w-full rounded-md bg-[#0b1220] border border-white/10 px-3 py-2 text-white" 
          placeholder="CLOSE" 
          value={confirmText} 
          onChange={(e) => setConfirmText(e.target.value)} 
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setConfirmClose(false); setConfirmText(''); }}>Cancel</Button>
          <Button 
            variant="danger" 
            disabled={confirmText !== 'CLOSE'} 
            onClick={() => { setConfirmClose(false); setConfirmText(''); alert('Account closure requested'); }}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
