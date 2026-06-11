'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

/* ── SVG icon helpers ── */
const icons: Record<string, React.ReactNode> = {
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  events: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  relawan: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  laporan: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  sertifikat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  profil: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  pengaturan: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const userNav = [
  { href: '/dashboard',  label: 'Dashboard',  icon: 'dashboard' },
  { href: '/sertifikat', label: 'Sertifikat',  icon: 'sertifikat' },
  { href: '/profile',    label: 'Profil',      icon: 'profil' },
  { href: '/settings',   label: 'Pengaturan',  icon: 'pengaturan' },
];

const adminNav = [
  { href: '/dashboard/admin',          label: 'Dashboard',    icon: 'dashboard' },
  { href: '/dashboard/admin/events',    label: 'Kelola Event', icon: 'events' },
  { href: '/dashboard/admin/relawan',   label: 'Relawan',      icon: 'relawan' },
  { href: '/dashboard/admin/laporan',   label: 'Laporan',      icon: 'laporan' },
  { href: '/profile',                   label: 'Profil',       icon: 'profil' },
  { href: '/settings',                  label: 'Pengaturan',   icon: 'pengaturan' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loadFromStorage } = useAuthStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => { loadFromStorage(); }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const nav = user?.role === 'ADMIN' ? adminNav : userNav;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/admin') return pathname === '/dashboard/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', flexShrink: 0,
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
      borderRight: '1px solid rgba(14,165,233,0.08)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 40,
      boxShadow: '4px 0 24px rgba(14,165,233,0.03)',
    }}>
      <style>{`
        @keyframes _sidebarFadeIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        .sidebar-nav-item { transition: all 0.2s cubic-bezier(0.4,0,0.2,1) !important; }
        .sidebar-nav-item:hover { transform: translateX(3px); }
      `}</style>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', padding: '26px 22px 20px', borderBottom: '1px solid rgba(14,165,233,0.06)', display: 'flex', alignItems: 'center', gap: '11px', animation: '_sidebarFadeIn 0.4s ease both' }}>
        <img src="/LOGO_PILAR.png" alt="PILAR" style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} />
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>PILAR</span>
      </Link>

      {/* User info */}
      {user && (
        <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(14,165,233,0.06)', display: 'flex', alignItems: 'center', gap: '12px', animation: '_sidebarFadeIn 0.5s ease both' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#bae6fd,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#fff', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 8px rgba(14,165,233,0.25)' }}>
            {user.foto ? <img src={user.foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/> : user.nama?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0c4a6e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nama}</div>
            <div style={{ fontSize: '11px', color: '#7baac7', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.4)' }}/>
              {user.role === 'ADMIN' ? 'Administrator' : 'Relawan'}
            </div>
          </div>
        </div>
      )}

      {/* Nav label */}
      <div style={{ padding: '18px 22px 6px', fontSize: '10px', fontWeight: '600', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Menu</div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
        {nav.map((item, idx) => {
          const active = isActive(item.href);
          const hovered = hoveredItem === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="sidebar-nav-item"
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '10px',
                marginBottom: '2px', textDecoration: 'none', fontSize: '13.5px',
                fontWeight: active ? '600' : '400',
                color: active ? '#0369a1' : hovered ? '#0c4a6e' : '#4a6580',
                background: active ? 'linear-gradient(135deg, #e0f2fe, #f0f9ff)' : hovered ? 'rgba(14,165,233,0.04)' : 'transparent',
                boxShadow: active ? '0 2px 8px rgba(14,165,233,0.1)' : 'none',
                animation: `_sidebarFadeIn 0.3s ease ${0.05 * idx}s both`,
              }}
            >
              <span style={{ color: active ? '#0ea5e9' : '#94a3b8', transition: 'color 0.2s', flexShrink: 0 }}>{icons[item.icon]}</span>
              {item.label}
              {active && <span style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 8px rgba(14,165,233,0.5)' }}/>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(14,165,233,0.06)' }}>
        <button
          onClick={handleLogout}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
        >
          {icons.logout} Keluar
        </button>
      </div>
    </aside>
  );
}

// Layout wrapper
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #fdfaf5 0%, #f0f7ff 100%)' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '36px 44px', minHeight: '100vh', maxWidth: '1100px' }}>
        {children}
      </main>
    </div>
  );
}