'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';

// SVG Icons inline
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="3"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

export default function EventDetailPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const { user, logout, loadFromStorage } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [statusDaftar, setStatusDaftar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadFromStorage(); setMounted(true); fetchEvent(); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  useEffect(() => { if (user && eventId) fetchStatusDaftar(); }, [user, eventId]);

  const fetchEvent = async () => {
    try { const res = await api.get(`/events/${eventId}`); setEvent(res.data); }
    catch { router.push('/'); } finally { setLoading(false); }
  };
  const fetchStatusDaftar = async () => {
    try { const res = await api.get(`/pendaftaran/cek/${eventId}`); setStatusDaftar(res.data); } catch {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link event disalin!');
  };

  const handleDaftar = () => {
    if (!user) { window.location.href = `/login?redirect=/events/${eventId}`; return; }
    router.push(`/events/${eventId}/daftar`);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#b0c8d8', fontSize: '14px' }}>Memuat...</p>
    </div>
  );
  if (!event) return null;

  const sisaKuota = event.kuota - (event._count?.pendaftaran || 0);
  const kuotaPenuh = sisaKuota <= 0;
  const persen = Math.min(100, ((event._count?.pendaftaran || 0) / event.kuota) * 100);

  const statusBadge = ({
    UPCOMING: { bg: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', color: '#0369a1', label: 'Pendaftaran Dibuka' },
    ONGOING:  { bg: 'linear-gradient(135deg, #dcfce7, #f0fdf4)', color: '#059669', label: 'Sedang Berlangsung' },
    DONE:     { bg: 'linear-gradient(135deg, #f1f5f9, #f8fafc)', color: '#94a3b8', label: 'Sudah Selesai' },
  } as Record<string, { bg: string; color: string; label: string }>)[event.status] || { bg: '#f8fafc', color: '#94a3b8', label: event.status };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fdfaf5, #f0f7ff)' }}>
      <style>{`
        @keyframes _evFade { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .ev-info-card { transition: all 0.3s ease !important; }
        .ev-info-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.05) !important; transform: translateY(-2px) !important; }
        .ev-detail-section { transition: all 0.3s ease !important; }
        .ev-detail-section:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.04) !important; }
        .ev-cta-btn { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .ev-cta-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(14,165,233,0.35) !important; }
        .ev-share-btn { transition: all 0.2s ease !important; }
        .ev-share-btn:hover { background: rgba(14,165,233,0.06) !important; border-color: rgba(14,165,233,0.15) !important; }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(14,165,233,0.06)', boxShadow: '0 1px 12px rgba(0,0,0,0.03)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 18c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M3 12c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/></svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#0c4a6e' }}>PILAR</span>
        </Link>
        <Link href="/#events" style={{ fontSize: '13px', color: '#7baac7', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
          onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
        >← Kembali ke daftar event</Link>
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
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: '220px', background: '#fff', borderRadius: '14px',
                  border: '1px solid rgba(14,165,233,0.08)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                  padding: '6px', zIndex: 100,
                  animation: '_evFade 0.2s ease both',
                }}>
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
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
                      display: 'block', padding: '9px 12px', borderRadius: '8px',
                      textDecoration: 'none', fontSize: '13.5px', color: '#4a6580', fontWeight: '500',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >{item.label}</Link>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(14,165,233,0.06)', marginTop: '4px', paddingTop: '4px' }}>
                    <button onClick={() => { logout(); setMenuOpen(false); router.push('/'); }}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px',
                        fontSize: '13.5px', color: '#dc2626', background: 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >Keluar</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: '13px', color: '#4a6580', textDecoration: 'none', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >Masuk</Link>
              <Link href="/register" style={{ fontSize: '13px', color: '#fff', textDecoration: 'none', padding: '7px 16px', borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', fontWeight: '600', boxShadow: '0 4px 14px rgba(14,165,233,0.25)', transition: 'all 0.2s' }}>Daftar</Link>
            </>
          )}
        </div>
      </nav>

      {/* Konten utama */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px', alignItems: 'start' }}>

          {/* Kiri — Detail event */}
          <div style={{ animation: '_evFade 0.5s ease both' }}>
            {/* Badge status */}
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px', background: statusBadge.bg, color: statusBadge.color, display: 'inline-block', marginBottom: '16px' }}>
              {statusBadge.label}
            </span>

            {/* Judul */}
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '30px', color: '#0c4a6e', letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '22px' }}>
              {event.judul}
            </h1>

            {/* Gambar */}
            {event.gambar && (
              <div style={{ borderRadius: '18px', overflow: 'hidden', marginBottom: '26px', maxHeight: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                <img src={event.gambar} alt={event.judul}
                  style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
            )}

            {/* Info singkat dengan ikon */}
            <div className="ev-info-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', padding: '20px 22px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              {[
                { Icon: IconCalendar, text: event.tanggal ? format(new Date(event.tanggal), 'EEEE, d MMMM yyyy · HH:mm', { locale: id }) : '-' },
                { Icon: IconLocation, text: event.lokasi },
                { Icon: IconUsers, text: `${event._count?.pendaftaran || 0} dari ${event.kuota} relawan terdaftar` },
              ].map(({ Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: '#4a6580' }}>
                  <span style={{ color: '#0ea5e9', flexShrink: 0, width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(14,165,233,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon/></span>
                  {text}
                </div>
              ))}
            </div>

            {/* Tentang Event */}
            <div className="ev-detail-section" style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', padding: '22px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#0c4a6e', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', display: 'inline-block' }}/>
                Tentang Event
              </h2>
              <p style={{ fontSize: '14px', color: '#4a6580', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.deskripsi}</p>
            </div>

            {/* Detail Kegiatan */}
            <div className="ev-detail-section" style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', padding: '22px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#0c4a6e', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', display: 'inline-block' }}/>
                Detail Kegiatan
              </h2>
              {[
                { label: 'Peserta', content: (
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span>Relawan dibutuhkan: <strong style={{ color: '#0c4a6e' }}>{event.kuota} orang</strong></span>
                    <span>Sisa kuota: <strong style={{ color: kuotaPenuh ? '#dc2626' : '#059669' }}>{sisaKuota}</strong></span>
                  </div>
                )},
                { label: 'Tugas Relawan', content: 'Mengikuti program bersih pantai hingga selesai, memungut sampah, dan memilah berdasarkan jenisnya.' },
                { label: 'Kriteria Relawan', content: 'Memiliki kepedulian terhadap lingkungan, sehat jasmani, dan mampu berjalan di area pantai.' },
                { label: 'Perlengkapan', content: 'Pakaian dan alas kaki yang sesuai untuk pantai, sarung tangan (disediakan panitia), dan minum secukupnya.' },
                { label: 'Domisili', content: 'Terbuka untuk semua daerah' },
              ].map((item, i) => (
                <div key={i} style={{ paddingBottom: '14px', marginBottom: '14px', borderBottom: i < 4 ? '1px solid rgba(14,165,233,0.04)' : 'none' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '13.5px', color: '#4a6580', lineHeight: 1.6 }}>{item.content}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan — Card Pendaftaran */}
          <div style={{ position: 'sticky', top: '84px', animation: '_evFade 0.6s ease 0.2s both' }}>
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(14,165,233,0.06)', padding: '24px', boxShadow: '0 8px 32px rgba(14,165,233,0.08)', position: 'relative', overflow: 'hidden' }}>
              {/* Decorative top gradient */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#0ea5e9,#0369a1,#0ea5e9)', backgroundSize: '200% auto' }}/>

              {/* Header card */}
              <div style={{ marginBottom: '18px', paddingTop: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Daftar Relawan</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e', lineHeight: 1.3 }}>{event.judul}</div>
              </div>

              {/* Info card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'linear-gradient(135deg, #f8fbff, #fdfaf5)', borderRadius: '14px', marginBottom: '18px' }}>
                {[
                  { Icon: IconCalendar, label: 'Jadwal', text: event.tanggal ? format(new Date(event.tanggal), 'd MMM yyyy', { locale: id }) : '-' },
                  { Icon: IconLocation, label: 'Lokasi', text: event.lokasi },
                  { Icon: IconUsers,    label: 'Kuota',  text: `${sisaKuota} tempat tersisa` },
                  { Icon: IconClock,    label: 'Batas Daftar', text: event.tanggal ? format(new Date(event.tanggal), 'd MMM yyyy', { locale: id }) : '-' },
                ].map(({ Icon, label, text }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#0ea5e9', marginTop: '1px', flexShrink: 0, width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(14,165,233,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon/></span>
                    <div>
                      <div style={{ fontSize: '10px', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>{label}</div>
                      <div style={{ fontSize: '12.5px', color: '#0c4a6e', marginTop: '1px', fontWeight: '500' }}>{text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress kuota */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#7baac7', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '500' }}>{event._count?.pendaftaran || 0} terdaftar</span>
                  <span style={{ color: kuotaPenuh ? '#dc2626' : '#0369a1', fontWeight: '600' }}>{event.kuota} kapasitas</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(14,165,233,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${persen}%`, background: kuotaPenuh ? 'linear-gradient(to right,#f87171,#dc2626)' : 'linear-gradient(to right,#38bdf8,#0369a1)', borderRadius: '3px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px rgba(14,165,233,0.2)' }}/>
                </div>
              </div>

              {/* Tombol aksi */}
              {statusDaftar?.terdaftar ? (
                <div style={{ padding: '14px', borderRadius: '14px', textAlign: 'center',
                  background: statusDaftar.status === 'APPROVED' ? 'linear-gradient(135deg, #dcfce7, #f0fdf4)' : statusDaftar.status === 'REJECTED' ? 'linear-gradient(135deg, #fee2e2, #fef2f2)' : 'linear-gradient(135deg, #fef3c7, #fffbeb)',
                  color: statusDaftar.status === 'APPROVED' ? '#059669' : statusDaftar.status === 'REJECTED' ? '#dc2626' : '#d97706',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '3px' }}>Kamu sudah terdaftar</div>
                  <div style={{ fontSize: '12px' }}>
                    Status: {statusDaftar.status === 'APPROVED' ? 'Diterima' : statusDaftar.status === 'REJECTED' ? 'Ditolak' : 'Menunggu Verifikasi'}
                  </div>
                </div>
              ) : kuotaPenuh ? (
                <div style={{ padding: '14px', borderRadius: '14px', textAlign: 'center', background: 'linear-gradient(135deg, #fee2e2, #fef2f2)', color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>
                  Kuota sudah penuh
                </div>
              ) : event.status === 'DONE' ? (
                <div style={{ padding: '14px', borderRadius: '14px', textAlign: 'center', background: '#f8fafc', color: '#94a3b8', fontSize: '13px' }}>Event sudah selesai</div>
              ) : (
                <button onClick={handleDaftar} className="ev-cta-btn" style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(14,165,233,0.25)' }}>
                  {user ? 'Daftar Jadi Relawan' : 'Masuk untuk Mendaftar'}
                </button>
              )}

              {/* Tombol share */}
              <button onClick={handleShare} className="ev-share-btn" style={{ width: '100%', marginTop: '10px', padding: '11px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(14,165,233,0.1)', color: '#4a6580', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontWeight: '500' }}>
                <IconShare/> Bagikan Event
              </button>

              <p style={{ fontSize: '11px', color: '#b0c8d8', textAlign: 'center', marginTop: '14px', lineHeight: 1.5 }}>
                Pendaftaran diverifikasi oleh admin
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}