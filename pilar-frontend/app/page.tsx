'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Dock, DockIcon } from '@/components/ui/dock';

export default function MainPage() {
  const { user, logout, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvent: 0, totalRelawan: 0, totalSampahKg: 0 });
  const [loadingEvents, setLoadingEvents] = useState(true);
  // PBI #30 - Pencarian (nama/lokasi) + filter status event di landing page.
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  // PBI #36 - Verifikasi keaslian sertifikat oleh guest.
  const [nomorVerif, setNomorVerif] = useState('');
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifResult, setVerifResult] = useState<any>(null);
  const [verifError, setVerifError] = useState('');

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
    fetchData();
    // Mulai dari atas halaman saat mount (animasi GSAP sudah dihapus).
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [evRes, stRes] = await Promise.all([
        api.get('/events'),
        api.get('/events/stats'),
      ]);
      setEvents(evRes.data);
      setStats(stRes.data);
    } catch {} finally { setLoadingEvents(false); }
  };

  // PBI #36 - Panggil endpoint publik verifikasi sertifikat.
  const handleVerifikasi = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomor = nomorVerif.trim();
    if (!nomor) return;
    setVerifLoading(true);
    setVerifResult(null);
    setVerifError('');
    try {
      const res = await api.get(`/sertifikat/verifikasi/${encodeURIComponent(nomor)}`);
      setVerifResult(res.data);
    } catch {
      setVerifError('Sertifikat tidak ditemukan');
    } finally {
      setVerifLoading(false);
    }
  };

  // PBI #30 - Filter event sisi-client: cocokkan nama/lokasi (case-insensitive) + status.
  const q = search.trim().toLowerCase();
  const filteredEvents = events.filter((e: any) => {
    const cocokTeks = !q
      || (e.judul || '').toLowerCase().includes(q)
      || (e.lokasi || '').toLowerCase().includes(q);
    const cocokStatus = !filterStatus || e.status === filterStatus;
    return cocokTeks && cocokStatus;
  });

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

      {/* Floating liquid-glass dock (replaces the top navbar) */}
      <Dock>
        {/* Brand — PILAR logo (returns to Beranda / top of page) */}
        <DockIcon label="PILAR" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/LOGO_PILAR.png" alt="PILAR" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        </DockIcon>

        <span style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.25)', margin: '0 4px' }}/>

        <DockIcon
          label="Tentang Kami"
          onClick={() => {
            // Scroll to the VERTICAL CENTER of tentang — matches the wave
            // timeline's end (scroll 220vh), so the wave is fully gone on
            // arrival and tentang fills the viewport cleanly.
            const el = document.getElementById('tentang');
            if (!el) return;
            const rectTop = el.getBoundingClientRect().top + window.scrollY;
            const target = rectTop + el.offsetHeight / 2 - window.innerHeight / 2;
            window.scrollTo({ top: target, behavior: 'smooth' });
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </DockIcon>

        <DockIcon
          label="Event Mendatang"
          onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </DockIcon>

        {mounted && user ? (
          <>
            <DockIcon
              label="Dashboard"
              onClick={() => router.push(user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1"/>
                <rect x="14" y="3" width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
                <rect x="3" y="16" width="7" height="5" rx="1"/>
              </svg>
            </DockIcon>

            {user.role !== 'ADMIN' && (
              <DockIcon label="Sertifikat" onClick={() => router.push('/sertifikat')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="9" r="5"/>
                  <path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5"/>
                </svg>
              </DockIcon>
            )}

            <DockIcon label="Profil" onClick={() => router.push('/profile')}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(14,165,233,0.25)',
              }}>
                {user.foto
                  ? <img src={user.foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                  : user.nama?.charAt(0).toUpperCase()}
              </div>
            </DockIcon>

            <DockIcon label="Pengaturan" onClick={() => router.push('/settings')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </DockIcon>

            <span style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.25)', margin: '0 4px' }}/>

            <DockIcon label="Keluar" onClick={() => { logout(); router.push('/'); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </DockIcon>
          </>
        ) : mounted && (
          <>
            <DockIcon label="Masuk" onClick={() => router.push('/login')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </DockIcon>

            <DockIcon label="Daftar" onClick={() => router.push('/register')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </DockIcon>
          </>
        )}
      </Dock>

      {/* Hero */}
      <section id="hero" style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        backgroundImage: 'url(/pilar-main-bg.JPEG)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        {/* Dark gradient overlay — keeps text readable on any photo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(3,21,45,0.55) 0%, rgba(3,21,45,0.35) 45%, rgba(3,21,45,0.65) 100%)',
          pointerEvents: 'none',
        }}/>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.18) 0%, transparent 70%)', animation: '_float 6s ease-in-out infinite', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', animation: '_float 8s ease-in-out infinite 1s', pointerEvents: 'none' }}/>

        <p style={{
          position: 'relative',
          fontSize: '11px', letterSpacing: '0.2em', color: '#bae6fd',
          textTransform: 'uppercase', marginBottom: '28px',
          animation: '_heroFade 0.6s ease 0.1s both',
          textShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}>Peduli Laut dan Pesisir</p>
        <h1 style={{
          position: 'relative',
          fontFamily: 'DM Serif Display, serif',
          fontSize: 'clamp(72px, 14vw, 140px)',
          color: '#ffffff', letterSpacing: '-0.03em',
          lineHeight: 1, marginBottom: '20px',
          animation: '_heroFade 0.8s ease 0.2s both',
          background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #7dd3fc 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.35))',
        }}>PILAR</h1>
        <p style={{
          position: 'relative',
          fontSize: '15px', color: '#e0f2fe', maxWidth: '420px', lineHeight: 1.7,
          animation: '_heroFade 0.8s ease 0.4s both',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          Platform relawan pembersihan pantai terbesar di Indonesia.
          Bergabung dan jadilah bagian dari perubahan.
        </p>
        <div style={{ position: 'relative', display: 'flex', gap: '12px', marginTop: '32px', animation: '_heroFade 0.8s ease 0.6s both' }}>
          <a href="#events" className="btn-cta" style={{
            fontSize: '14px', color: '#fff', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '12px',
            background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', fontWeight: '600',
            boxShadow: '0 4px 20px rgba(14,165,233,0.45)',
          }}>Jelajahi Event</a>
          <a href="#tentang" style={{
            fontSize: '14px', color: '#ffffff', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.12)', fontWeight: '500',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          >Tentang Kami</a>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', animation: '_heroFade 1s ease 0.8s both' }}>
          <div style={{ width: '1px', height: '0px', background: 'linear-gradient(to bottom,transparent,#e0f2fe)', animation: '_heroLine 1s ease 1.2s forwards' }}/>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e0f2fe" strokeWidth="2" style={{ animation: '_float 2s ease-in-out infinite' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </section>

      {/* Statistik Real */}
      <section id="tentang" style={{
        padding: '100px 48px',
        background: 'linear-gradient(180deg, #fdfaf5 0%, #f0f7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
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

      {/* PBI #30 - Syifa Rizani - Fitur Pencarian dan Filter Event Berdasarkan Nama/Lokasi/Status */}
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

          {/* PBI #30 - Kontrol pencarian & filter status */}
          <div style={{ maxWidth: '720px', margin: '0 auto 36px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7baac7" strokeWidth="2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari event..."
                style={{
                  width: '100%', padding: '11px 16px 11px 40px', borderRadius: '12px',
                  border: '1.5px solid rgba(14,165,233,0.12)', background: '#fff',
                  fontSize: '14px', fontFamily: 'inherit', color: '#0c4a6e',
                  outline: 'none', boxSizing: 'border-box', transition: 'all 0.25s ease',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(14,165,233,0.08)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { key: '', label: 'Semua' },
                { key: 'UPCOMING', label: 'Mendatang' },
                { key: 'ONGOING', label: 'Berlangsung' },
                { key: 'DONE', label: 'Selesai' },
              ].map(f => {
                const aktif = filterStatus === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    style={{
                      padding: '9px 16px', borderRadius: '10px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                      border: aktif ? '1.5px solid transparent' : '1.5px solid rgba(14,165,233,0.12)',
                      background: aktif ? 'linear-gradient(135deg,#0ea5e9,#0369a1)' : '#fff',
                      color: aktif ? '#fff' : '#7baac7',
                      boxShadow: aktif ? '0 4px 14px rgba(14,165,233,0.25)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >{f.label}</button>
                );
              })}
            </div>
          </div>

          {loadingEvents ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#b0c8d8', fontSize: '14px' }}>Memuat event...</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#b0c8d8', fontSize: '14px' }}>Belum ada event</div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#b0c8d8', fontSize: '14px' }}>Tidak ada event yang cocok dengan pencarian</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '24px' }}>
              {filteredEvents.map((e: any, idx: number) => (
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

      {/* PBI #36 - Marshall Rasendria - Verifikasi Keaslian Sertifikat oleh Guest */}
      <section id="verifikasi" style={{ padding: '100px 48px', background: 'linear-gradient(180deg, #f0f7ff 0%, #fdfaf5 100%)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>Keaslian Dokumen</p>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '40px', color: '#0c4a6e', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Verifikasi Sertifikat
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '440px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Masukkan nomor sertifikat untuk memeriksa keasliannya dan melihat data relawan serta event terkait.
          </p>

          <form onSubmit={handleVerifikasi} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: verifResult || verifError ? '28px' : 0 }}>
            <input
              type="text"
              value={nomorVerif}
              onChange={e => setNomorVerif(e.target.value)}
              placeholder="Masukkan nomor sertifikat"
              style={{
                flex: '1 1 320px', minWidth: '240px', padding: '13px 18px', borderRadius: '12px',
                border: '1.5px solid rgba(14,165,233,0.15)', background: '#fff',
                fontSize: '14px', fontFamily: 'inherit', color: '#0c4a6e',
                outline: 'none', boxSizing: 'border-box', transition: 'all 0.25s ease',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(14,165,233,0.08)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.15)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button type="submit" disabled={verifLoading} className="btn-cta" style={{
              fontSize: '14px', color: '#fff', fontWeight: '600', fontFamily: 'inherit',
              padding: '13px 28px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
              cursor: verifLoading ? 'wait' : 'pointer', boxShadow: '0 4px 14px rgba(14,165,233,0.25)',
              opacity: verifLoading ? 0.7 : 1,
            }}>
              {verifLoading ? 'Memeriksa...' : 'Verifikasi'}
            </button>
          </form>

          {verifError && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '18px 24px', borderRadius: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {verifError}
            </div>
          )}

          {verifResult && (
            <div style={{ textAlign: 'left', padding: '28px', borderRadius: '18px', background: '#fff', border: '1px solid rgba(14,165,233,0.1)', boxShadow: '0 8px 28px rgba(14,165,233,0.1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg,#0ea5e9,#0369a1)' }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#16a34a' }}>Sertifikat Valid</div>
                  <div style={{ fontSize: '12.5px', color: '#7baac7', fontFamily: 'monospace', marginTop: '2px' }}>{verifResult.nomorSertifikat}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '4px' }}>Nama Relawan</div>
                  <div style={{ fontSize: '15px', color: '#0c4a6e', fontWeight: '600' }}>{verifResult.user?.nama}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '4px' }}>Event</div>
                  <div style={{ fontSize: '15px', color: '#0c4a6e', fontWeight: '600' }}>{verifResult.event?.judul}</div>
                </div>
              </div>
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
                <img src="/LOGO_PILAR.png" alt="PILAR" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
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
