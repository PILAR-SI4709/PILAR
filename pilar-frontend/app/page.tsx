'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function MainPage() {
  const { user, logout, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvent: 0, totalRelawan: 0, totalSampahKg: 0 });
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
    fetchData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchData = async () => {
    try {
      const [evRes, stRes] = await Promise.all([
        api.get('/events?status=UPCOMING'),
        api.get('/events/stats'),
      ]);
      setEvents(evRes.data.slice(0, 6));
      setStats(stRes.data);
    } catch {} finally { setLoadingEvents(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <style>{`
        @keyframes _heroFade { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _heroLine { from { height:0; } to { height:48px; } }
        @keyframes _statCount { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes _shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .nav-link-hover { transition: all 0.2s ease !important; }
        .nav-link-hover:hover { background: rgba(14,165,233,0.06) !important; color: #0369a1 !important; }
        .event-card-premium { transition: all 0.35s cubic-bezier(0.4,0,0.2,1) !important; }
        .event-card-premium:hover { transform: translateY(-6px) !important; box-shadow: 0 20px 40px rgba(14,165,233,0.12) !important; border-color: rgba(14,165,233,0.2) !important; }
        .stat-card-premium { transition: all 0.3s ease !important; }
        .stat-card-premium:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(14,165,233,0.1) !important; }
        .btn-cta { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .btn-cta:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(14,165,233,0.3) !important; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '64px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(14,165,233,0.06)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.03)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 18c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M3 12c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>PILAR</span>
        </div>

        {/* Kanan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {mounted && user ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(o => !o)}
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
                <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#0c4a6e', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nama}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: '220px', background: '#fff', borderRadius: '14px',
                  border: '1px solid rgba(14,165,233,0.08)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                  padding: '6px', zIndex: 100,
                  animation: '_heroFade 0.2s ease both',
                }}>
                  {/* User info */}
                  <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid rgba(14,165,233,0.06)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#7baac7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.4)' }}/>
                      {user.role === 'ADMIN' ? 'Administrator' : 'Relawan'}
                    </div>
                  </div>
                  {(user.role === 'ADMIN' ? [
                    { href: '/dashboard/admin', label: 'Dashboard' },
                    { href: '/profile', label: 'Profil' },
                    { href: '/settings', label: 'Pengaturan' },
                  ] : [
                    { href: '/dashboard', label: 'Dashboard' },
                    { href: '/sertifikat', label: 'Sertifikat' },
                    { href: '/profile', label: 'Profil' },
                    { href: '/settings', label: 'Pengaturan' },
                  ]).map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="nav-link-hover" style={{
                      display: 'block', padding: '9px 12px', borderRadius: '8px',
                      textDecoration: 'none', fontSize: '13.5px', color: '#4a6580', fontWeight: '500',
                    }}>{item.label}</Link>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(14,165,233,0.06)', marginTop: '4px', paddingTop: '4px' }}>
                    <button onClick={() => { logout(); setMenuOpen(false); router.push('/'); }}
                      className="nav-link-hover"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px',
                        fontSize: '13.5px', color: '#dc2626', background: 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
                      }}>Keluar</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="nav-link-hover" style={{
                fontSize: '13.5px', color: '#4a6580', textDecoration: 'none',
                padding: '7px 16px', borderRadius: '8px', fontWeight: '500',
              }}>Masuk</Link>
              <Link href="/register" className="btn-cta" style={{
                fontSize: '13.5px', color: '#fff', textDecoration: 'none',
                padding: '8px 20px', borderRadius: '10px',
                background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', fontWeight: '600',
                boxShadow: '0 4px 14px rgba(14,165,233,0.25)',
              }}>Daftar</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.04) 0%, transparent 70%)',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)', animation: '_float 6s ease-in-out infinite', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)', animation: '_float 8s ease-in-out infinite 1s', pointerEvents: 'none' }}/>

        <p style={{
          fontSize: '11px', letterSpacing: '0.2em', color: '#7baac7',
          textTransform: 'uppercase', marginBottom: '28px',
          animation: '_heroFade 0.6s ease 0.1s both',
        }}>Peduli Laut dan Pesisir</p>
        <h1 style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 'clamp(72px, 14vw, 140px)',
          color: '#0c4a6e', letterSpacing: '-0.03em',
          lineHeight: 1, marginBottom: '20px',
          animation: '_heroFade 0.8s ease 0.2s both',
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>PILAR</h1>
        <p style={{
          fontSize: '15px', color: '#7baac7', maxWidth: '420px', lineHeight: 1.7,
          animation: '_heroFade 0.8s ease 0.4s both',
        }}>
          Platform relawan pembersihan pantai terbesar di Indonesia.
          Bergabung dan jadilah bagian dari perubahan.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', animation: '_heroFade 0.8s ease 0.6s both' }}>
          <a href="#events" className="btn-cta" style={{
            fontSize: '14px', color: '#fff', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '12px',
            background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', fontWeight: '600',
            boxShadow: '0 4px 20px rgba(14,165,233,0.3)',
          }}>Jelajahi Event</a>
          <a href="#tentang" style={{
            fontSize: '14px', color: '#0369a1', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '12px',
            background: 'rgba(14,165,233,0.06)', fontWeight: '500',
            border: '1px solid rgba(14,165,233,0.12)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.06)'; }}
          >Tentang Kami</a>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', animation: '_heroFade 1s ease 0.8s both' }}>
          <div style={{ width: '1px', height: '0px', background: 'linear-gradient(to bottom,transparent,#bae6fd)', animation: '_heroLine 1s ease 1.2s forwards' }}/>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bae6fd" strokeWidth="2" style={{ animation: '_float 2s ease-in-out infinite' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </section>

      {/* Statistik Real */}
      <section id="tentang" style={{ padding: '100px 48px', background: 'linear-gradient(180deg, #fdfaf5 0%, #f0f7ff 100%)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>Tentang Kami</p>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '40px', color: '#0c4a6e', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Bersama Jaga Laut Indonesia
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto' }}>
              PILAR adalah platform yang menghubungkan relawan dan penyelenggara
              kegiatan bersih pantai di seluruh Indonesia. Bersama, kita jaga kebersihan
              laut untuk generasi mendatang.
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              { value: stats.totalEvent, label: 'Event Diselenggarakan', suffix: '', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { value: stats.totalRelawan, label: 'Total Relawan Aktif', suffix: '', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { value: stats.totalSampahKg, label: 'Kilogram Sampah Terkumpul', suffix: ' kg', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> },
            ].map((s, i) => (
              <div key={i} className="stat-card-premium" style={{
                background: '#fff', borderRadius: '20px',
                border: '1px solid rgba(14,165,233,0.08)', padding: '32px 28px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                animation: `_statCount 0.5s ease ${0.15 * i}s both`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>
                <div style={{ marginBottom: '14px', color: '#0ea5e9' }}>{s.icon}</div>
                <div style={{ fontSize: '44px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '8px' }}>
                  {s.value.toLocaleString('id-ID')}{s.suffix}
                </div>
                <div style={{ fontSize: '13px', color: '#7baac7', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Mendatang */}
      <section id="events" style={{ padding: '100px 48px', background: '#fff' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>Event Mendatang</p>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '40px', color: '#0c4a6e', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Bergabung Sekarang
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
              Temukan event bersih pantai terdekat dan mulai berkontribusi untuk lingkungan
            </p>
          </div>

          {loadingEvents ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#b0c8d8', fontSize: '14px' }}>Memuat event...</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#b0c8d8', fontSize: '14px' }}>Belum ada event mendatang</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '24px' }}>
              {events.map((e: any, idx: number) => (
                <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="event-card-premium"
                    style={{
                      background: '#fff', borderRadius: '18px',
                      border: '1px solid rgba(14,165,233,0.06)', overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      animation: `_statCount 0.5s ease ${0.08 * idx}s both`,
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      {e.gambar
                        ? <img src={e.gambar} alt={e.judul} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                            onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}
                          />
                        : <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg,#e0f2fe 0%,#bae6fd 50%,#7dd3fc 100%)' }}/>
                      }
                      {/* Date badge overlay */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '6px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600' }}>
                          {e.tanggal ? format(new Date(e.tanggal), 'd MMM', { locale: id }) : '-'}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#0c4a6e', marginBottom: '6px', lineHeight: 1.3 }}>{e.judul}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#7baac7', marginBottom: '16px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {e.lokasi}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ display: 'flex' }}>
                            {[0,1,2].map(i => (
                              <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(135deg, ${['#bae6fd','#7dd3fc','#38bdf8'][i]}, #0ea5e9)`, border: '2px solid #fff', marginLeft: i > 0 ? '-6px' : 0 }}/>
                            ))}
                          </div>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {e._count?.pendaftaran || 0}/{e.kuota}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600', padding: '5px 14px', background: 'linear-gradient(135deg,#e0f2fe,#f0f9ff)', borderRadius: '8px' }}>
                          Detail →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 48px 36px', borderTop: '1px solid rgba(14,165,233,0.06)', background: 'linear-gradient(180deg, #fff 0%, #f0f7ff 100%)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Top row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '48px', marginBottom: '40px' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 18c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M3 12c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/></svg>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>PILAR</span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#7baac7', lineHeight: 1.7, maxWidth: '280px' }}>
                Platform relawan pembersihan pantai terbesar di Indonesia. Bersama menjaga laut untuk generasi mendatang.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Navigasi</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { href: '#tentang', label: 'Tentang Kami' },
                  { href: '#events', label: 'Cari Event' },
                  { href: '/login', label: 'Masuk', isLink: true },
                  { href: '/register', label: 'Daftar', isLink: true },
                ].map(item => item.isLink ? (
                  <Link key={item.href} href={item.href} style={{ fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                  >{item.label}</Link>
                ) : (
                  <a key={item.href} href={item.href} style={{ fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                  >{item.label}</a>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Hubungi Kami</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#25D366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href="mailto:pilar.indonesia@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7l-10 7L2 7"/></svg>
                  Email
                </a>
                <a href="https://instagram.com/pilar.indonesia" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E4405F')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(14,165,233,0.06)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>© 2026 PILAR — Peduli Laut dan Pesisir</span>
            <span style={{ fontSize: '12.5px', color: '#b0c8d8', fontStyle: 'italic' }}>Menjaga laut untuk generasi mendatang</span>
          </div>
        </div>
      </footer>
    </div>
  );
}