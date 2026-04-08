'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

type Props = {
  orgSlug: string;
  orgName: string;
  userName: string;
};

export function OrgNav({ orgSlug, orgName, userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const links = [
    { href: `/${orgSlug}/dashboard`, label: 'Dashboard' },
    { href: `/${orgSlug}/contacts`, label: 'Contacts' },
    { href: `/${orgSlug}/interactions`, label: 'Interactions' },
    { href: `/${orgSlug}/forecast`, label: 'Forecast' },
    { href: `/${orgSlug}/account`, label: 'Account' },
  ];

  const isActive = (href: string) => {
    if (href.endsWith('/contacts')) {
      return pathname.startsWith(`/${orgSlug}/contacts`);
    }
    return pathname === href;
  };

  return (
    <header className="bg-forest-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-8">
        {/* Logo */}
        <Link href={`/${orgSlug}/dashboard`} className="flex items-center gap-2.5 shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="opacity-90">
            <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"/>
            <path d="M12 12v10M2 7l10 5 10-5" stroke="white" strokeWidth="1.5"/>
          </svg>
          <span className="font-bold text-base tracking-tight">Steward</span>
          <span className="text-xs opacity-50 ml-0.5">{orgName}</span>
        </Link>

        {/* Nav */}
        <nav className="flex gap-1 flex-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-70">{userName}</span>
          <button
            onClick={handleSignOut}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
