'use client';
// PBI #38 - Naufal Athalino - Halaman Daftar Laporan Kegiatan (semua event + ringkasan statistik)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminLaporanPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/laporan').then(r => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusStyle = (s: string) => ({
    UPCOMING: { color: '#0369a1', bg: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', label: 'Mendatang' },
    ONGOING:  { color: '#059669', bg: 'linear-gradient(135deg, #dcfce7, #f0fdf4)', label: 'Berlangsung' },
    DONE:     { color: '#94a3b8', bg: 'linear-gradient(135deg, #f1f5f9, #f8fafc)', label: 'Selesai' },
  }[s] || { color: '#94a3b8', bg: '#f8fafc', label: s });

  const filtered = filter === 'ALL' ? events : events.filter(e => e.status === filter);

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _lapFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .lapl-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .lapl-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(14,165,233,0.08) !important; border-color: rgba(14,165,233,0.12) !important; }
        .lapl-action { transition: all 0.2s ease !important; }
        .lapl-action:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 14px rgba(14,165,233,0.2) !important; }
        .lapl-filter-btn { transition: all 0.2s ease !important; }
        .lapl-filter-btn:hover { background: rgba(14,165,233,0.06) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '20px', animation: '_lapFade 0.5s ease both' }}>
        <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: '600' }}>Admin</p>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>Laporan Kegiatan</h1>
      </div>

      {/* Petunjuk singkat */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'linear-gradient(135deg, #f0f9ff, #fdfaf5)', border: '1px solid rgba(14,165,233,0.1)', borderRadius: '14px', padding: '16px 18px', marginBottom: '24px', animation: '_lapFade 0.5s ease 0.05s both' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <div style={{ fontSize: '13px', color: '#4a6580', lineHeight: 1.6 }}>
          Setelah event selesai, klik <b style={{ color: '#0369a1' }}>Input Data &amp; Foto</b> pada event terkait untuk menambah data sampah dan mengunggah foto dokumentasi. Tombol <b style={{ color: '#0c4a6e' }}>Lihat Laporan</b> menampilkan rekap lengkap yang juga bisa dilihat publik.
        </div>
      </div>

      {/* Filter status */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '20px', background: 'linear-gradient(135deg, #f0f7ff, #fdfaf5)', padding: '4px', borderRadius: '12px', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', animation: '_lapFade 0.5s ease 0.1s both' }}>
        {['ALL', 'DONE', 'ONGOING', 'UPCOMING'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="lapl-filter-btn" style={{
            padding: '7px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontSize: '12.5px', fontWeight: filter === f ? '600' : '500',
            background: filter === f ? '#fff' : 'transparent',
            color: filter === f ? '#0c4a6e' : '#7baac7',
            boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          }}>
            {{ ALL: 'Semua', DONE: 'Selesai', ONGOING: 'Berlangsung', UPCOMING: 'Mendatang' }[f]}
            <span style={{ marginLeft: '6px', fontSize: '11px', color: filter === f ? '#0ea5e9' : '#b0c8d8', fontWeight: '600' }}>
              {f === 'ALL' ? events.length : events.filter(e => e.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Daftar event */}
      {loading ? (
        <p style={{ color: '#b0c8d8', fontSize: '14px' }}>Memuat...</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(14,165,233,0.06)', padding: '56px', textAlign: 'center', color: '#7baac7', fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: '_lapFade 0.5s ease 0.2s both' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4e2ed" strokeWidth="1.5" style={{ margin: '0 auto 14px', display: 'block' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Belum ada event
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((e: any, idx: number) => {
            const st = statusStyle(e.status);
            return (
              <div key={e.id} className="lapl-card" style={{
                background: '#fff', borderRadius: '18px',
                border: '1px solid rgba(14,165,233,0.06)',
                padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                animation: `_lapFade 0.4s ease ${0.06 * idx}s both`, flexWrap: 'wrap',
              }}>
                {/* Gambar kecil */}
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 8px rgba(14,165,233,0.1)' }}>
                  {e.gambar && <img src={e.gambar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>}
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: '600', color: '#0c4a6e' }}>{e.judul}</span>
                    <span style={{ fontSize: '10.5px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#7baac7', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {e.lokasi}
                    <span style={{ color: '#d4e2ed' }}>·</span>
                    {e.tanggal ? format(new Date(e.tanggal), 'd MMM yyyy', { locale: id }) : '-'}
                  </div>
                  {/* Ringkasan angka */}
                  <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '11.5px', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      {e._count?.pendaftaran || 0} relawan
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                      {e._count?.sampah || 0} entri sampah
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      {e._count?.dokumentasi || 0} foto
                    </span>
                  </div>
                </div>

                {/* Aksi */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link href={`/dashboard/admin/events/${e.id}/laporan`} className="lapl-action" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#fff', textDecoration: 'none', padding: '9px 16px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', borderRadius: '10px', fontWeight: '600', boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                    Input Data &amp; Foto
                  </Link>
                  <Link href={`/laporan/${e.id}`} className="lapl-action" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#0369a1', textDecoration: 'none', padding: '9px 16px', background: 'rgba(14,165,233,0.06)', borderRadius: '10px', fontWeight: '600' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Lihat Laporan
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
