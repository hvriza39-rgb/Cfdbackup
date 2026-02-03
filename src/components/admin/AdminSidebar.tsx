'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const nav = [
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/messages/new', label: 'Send Message' }, // 👈 The button is here
  { href: '/admin/transactions', label: 'Transactions' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="p-4">
      <div className="text-lg font-semibold mb-4">Admin</div>

      <nav className="space-y-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block rounded-md px-3 py-2 text-sm transition-colors',
                active ? 'bg-surface text-text' : 'text-muted hover:bg-surface',
              )}
            >
              {item.label}
            </Link>
          );
        })}

        <form action="/api/admin/auth/logout" method="post" className="mt-4">
          <button
            type="submit"
            className="w-full text-left rounded-md px-3 py-2 text-sm text-danger hover:bg-surface transition-colors"
          >
            Logout
          </button>
        </form>
      </nav>
    </div>
  );
}

// force update v1