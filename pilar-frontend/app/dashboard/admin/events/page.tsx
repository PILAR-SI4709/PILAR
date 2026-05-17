'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try { const res = await api.get('/events'); setEvents(res.data); }
    catch {} finally { setLoading(false); }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Hapus event ini? Semua data pendaftaran akan ikut terhapus.')) return;
    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event dihapus');
      fetchEvents();
    } catch { toast.error('Gagal menghapus event'); }
  };

  const statusStyle = (s: string) => ({
    UPCOMING: { color: '#0369a1', bg: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)', label: 'Mendatang' },
    ONGOING:  { color: '#059669', bg: 'linear-gradient(135deg, #dcfce7, #f0fdf4)', label: 'Berlangsung' },
    DONE:     { color: '#94a3b8', bg: 'linear-gradient(135deg, #f1f5f9, #f8fafc)', label: 'Selesai' },
  }[s] || { color: '#94a3b8', bg: '#f8fafc', label: s });

  const filtered = filter === 'ALL' ? events : events.filter(e => e.status === filter);

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _aeFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .ae-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .ae-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(14,165,233,0.08) !important; border-color: rgba(14,165,233,0.12) !important; }
        .ae-action { transition: all 0.2s ease !important; }
        .ae-action:hover { transform: translateY(-1px) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important; }
        .ae-filter-btn { transition: all 0.2s ease !important; }
        .ae-filter-btn:hover { background: rgba(14,165,233,0.06) !important; }
        .ae-add-btn { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .ae-add-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(14,165,233,0.3) !important; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', animation: '_aeFade 0.5s ease both' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: '600' }}>Admin</p>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0c4a6e' }}>Kelola Event</h1>
        </div>
        <Link href="/dashboard/admin/events/new" className="ae-add-btn" style={{ padding: '10px 22px', borderRadius: '12px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 14px rgba(14,165,233,0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Event
        </Link>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '24px', background: 'linear-gradient(135deg, #f0f7ff, #fdfaf5)', padding: '4px', borderRadius: '12px', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', animation: '_aeFade 0.5s ease 0.1s both' }}>
        {['ALL', 'UPCOMING', 'ONGOING', 'DONE'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="ae-filter-btn" style={{
            padding: '7px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontSize: '12.5px', fontWeight: filter === f ? '600' : '500',
            background: filter === f ? '#fff' : 'transparent',
            color: filter === f ? '#0c4a6e' : '#7baac7',
            boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
          }}>
            {{ ALL: 'Semua', UPCOMING: 'Mendatang', ONGOING: 'Berlangsung', DONE: 'Selesai' }[f]}
            <span style={{ marginLeft: '6px', fontSize: '11px', color: filter === f ? '#0ea5e9' : '#b0c8d8', fontWeight: '600' }}>
              {f === 'ALL' ? events.length : events.filter(e => e.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* List event */}
      {loading ? (
        <p style={{ color: '#b0c8d8', fontSize: '14px' }}>Memuat...</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(14,165,233,0.06)', padding: '56px', textAlign: 'center', color: '#7baac7', fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: '_aeFade 0.5s ease 0.2s both' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4e2ed" strokeWidth="1.5" style={{ margin: '0 auto 14px', display: 'block' }}><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Belum ada event
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((e: any, idx: number) => {
            const st = statusStyle(e.status);
            const persen = Math.min(100, ((e._count?.pendaftaran || 0) / e.kuota) * 100);
            return (
              <div key={e.id} className="ae-card" style={{
                background: '#fff', borderRadius: '18px',
                border: '1px solid rgba(14,165,233,0.06)',
                padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                animation: `_aeFade 0.4s ease ${0.06 * idx}s both`,
              }}>
                {/* Gambar kecil */}
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 8px rgba(14,165,233,0.1)' }}>
                  {e.gambar && <img src={e.gambar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>{e.judul}</div>
                  <div style={{ fontSize: '12.5px', color: '#7baac7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {e.lokasi}
                    <span style={{ color: '#d4e2ed' }}>·</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    {e.tanggal ? format(new Date(e.tanggal), 'd MMM yyyy', { locale: id }) : '-'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <div style={{ width: '80px', height: '4px', borderRadius: '2px', background: 'rgba(14,165,233,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${persen}%`, background: 'linear-gradient(to right,#38bdf8,#0369a1)', borderRadius: '2px', transition: 'width 0.5s' }}/>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{e._count?.pendaftaran || 0}/{e.kuota} relawan</span>
                  </div>
                </div>

                <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', background: st.bg, color: st.color, flexShrink: 0 }}>
                  {st.label}
                </span>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <Link href={`/dashboard/admin/events/${e.id}/peserta`} className="ae-action" style={{ fontSize: '12px', color: '#0369a1', textDecoration: 'none', padding: '6px 12px', background: 'rgba(14,165,233,0.06)', borderRadius: '8px', fontWeight: '600' }}>
                    Relawan
                  </Link>
                  <Link href={`/laporan/${e.id}`} className="ae-action" style={{ fontSize: '12px', color: '#4a6580', textDecoration: 'none', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', fontWeight: '500' }}>
                    Laporan
                  </Link>
                  <Link href={`/dashboard/admin/events/${e.id}/edit`} className="ae-action" style={{ fontSize: '12px', color: '#4a6580', textDecoration: 'none', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', fontWeight: '500' }}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(e.id)} className="ae-action" style={{ fontSize: '12px', color: '#dc2626', background: '#fef2f2', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', fontWeight: '600' }}>
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
