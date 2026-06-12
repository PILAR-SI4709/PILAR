'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function LandingSidebar() {
  const { user, logout, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const dashboardHref = user.role === 'ADMIN'
    ? '/dashboard/admin'
    : '/dashboard';

  const nav = user.role === 'ADMIN' ? [
    { href: dashboardHref, label: 'Dashboard' },
    { href: '/profile',   label: 'Profil' },
    { href: '/settings',  label: 'Pengaturan' },
  ] : [
    { href: dashboardHref, label: 'Dashboard' },
    { href: '/sertifikat', label: 'Sertifikat' },
    { href: '/profile',   label: 'Profil' },
    { href: '/settings',  label: 'Pengaturan' },
  ];

  return (
    <>
      <style>{`
        @keyframes _lsSlideIn { from { opacity:0; transform:translateX(100%); } to { opacity:1; transform:translateX(0); } }
        @keyframes _lsOverlay { from { opacity:0; } to { opacity:1; } }
        .ls-nav-item { transition: all 0.2s ease !important; }
        .ls-nav-item:hover { transform: translateX(3px); background: rgba(14,165,233,0.04) !important; }
      `}</style>

      {/* Overlay mobile */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(12,74,110,0.15)', backdropFilter: 'blur(4px)', zIndex: 45,
          animation: '_lsOverlay 0.2s ease both',
        }}/>
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '260px', background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
        borderLeft: '1px solid rgba(14,165,233,0.08)',
        display: 'flex', flexDirection: 'column',
        zIndex: 50,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-8px 0 40px rgba(14,165,233,0.08)' : 'none',
      }}>

        {/* User info */}
        <div style={{ padding: '26px 22px 18px', borderBottom: '1px solid rgba(14,165,233,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Menu</span>
            <button onClick={() => setOpen(false)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}
            >×</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '600', color: '#fff', overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(14,165,233,0.3)',
            }}>
              {user.foto
                ? <img src={user.foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                : user.nama?.charAt(0).toUpperCase()
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#0c4a6e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nama}</div>
              <div style={{ fontSize: '11px', color: '#7baac7', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.4)' }}/>
                {user.role === 'ADMIN' ? 'Administrator' : 'Relawan'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 14px' }}>
          {nav.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="ls-nav-item" style={{
                display: 'block', padding: '10px 14px', borderRadius: '10px',
                marginBottom: '2px', textDecoration: 'none', fontSize: '13.5px',
                color: active ? '#0369a1' : '#4a6580',
                background: active ? 'linear-gradient(135deg, #e0f2fe, #f0f9ff)' : 'transparent',
                fontWeight: active ? '600' : '400',
                boxShadow: active ? '0 2px 8px rgba(14,165,233,0.08)' : 'none',
              }}>{item.label}</Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '14px', borderTop: '1px solid rgba(14,165,233,0.06)' }}>
          <button onClick={() => { logout(); router.push('/'); }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px',
              fontSize: '13.5px', color: '#94a3b8', background: 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
            }}>Keluar</button>
        </div>
      </aside>

      {/* Tombol buka sidebar — avatar di navbar */}
      <button onClick={() => setOpen(!open)}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
          transition: 'transform 0.2s ease',
        }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '600', color: '#fff', overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(14,165,233,0.25)',
        }}>
          {user.foto
            ? <img src={user.foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
            : user.nama?.charAt(0).toUpperCase()
          }
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
    </>
  );
}