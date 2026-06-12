'use client';
// PBI #35 - Marshall Rasendria - Hub Manajemen & Verifikasi Relawan Admin
// Verifikasi dilakukan langsung di menu ini (master-detail), tanpa redirect ke halaman event.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// TASK 3 - Label form kesehatan (selaras dengan form pendaftaran & backend)
const KESEHATAN_LABELS: { key: string; label: string }[] = [
  { key: 'tidakAdaPenyakitJantung', label: 'Tidak memiliki penyakit jantung' },
  { key: 'tidakAdaAsma', label: 'Tidak memiliki asma atau gangguan pernapasan' },
  { key: 'bisaBerjalanJauh', label: 'Mampu berjalan jauh lebih dari 2 km' },
  { key: 'tidakAlergiLaut', label: 'Tidak alergi terhadap lingkungan laut' },
  { key: 'tidakHamilAtauMenyusui', label: 'Tidak dalam kondisi hamil atau menyusui' },
];
const KESEHATAN_WAJIB = ['bisaBerjalanJauh'];

export default function AdminRelawanPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [pesertaByEvent, setPesertaByEvent] = useState<Record<string, any[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const evRes = await api.get('/events');
      const evs: any[] = evRes.data || [];
      setEvents(evs);

      // Ambil daftar pendaftar tiap event secara paralel agar bisa menampilkan
      // badge "menunggu" di daftar event. Kegagalan satu event tidak merusak lainnya.
      const pairs = await Promise.all(
        evs.map(async (e) => {
          try {
            const r = await api.get(`/pendaftaran/event/${e.id}`);
            return [e.id, r.data as any[]] as const;
          } catch {
            return [e.id, [] as any[]] as const;
          }
        }),
      );
      const map: Record<string, any[]> = {};
      pairs.forEach(([eid, list]) => { map[eid] = list; });
      setPesertaByEvent(map);

      // Jika dibuka dari tombol "Relawan" event tertentu (?event=<id>), pilih event itu.
      // Kalau tidak, auto-pilih event yang punya pendaftar menunggu lebih dulu, lalu event pertama.
      const fromQuery =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('event')
          : null;
      const targetByQuery = fromQuery && evs.some((e) => e.id === fromQuery) ? fromQuery : null;
      const perluVerifikasi = evs.find((e) => (map[e.id] || []).some((p) => p.status === 'PENDING'));
      setSelectedId(targetByQuery ?? perluVerifikasi?.id ?? evs[0]?.id ?? null);
    } catch {
      toast.error('Gagal memuat data relawan');
    } finally {
      setLoading(false);
    }
  };

  // #PBI17/#PBI18 - Update status partisipasi (Terima/Tolak) langsung dari hub ini.
  const updateStatus = async (pendaftaranId: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingId(pendaftaranId);
    try {
      await api.patch(`/pendaftaran/${pendaftaranId}/status`, { status });
      toast.success(status === 'APPROVED' ? 'Relawan diterima' : 'Relawan ditolak');
      if (selectedId) {
        const r = await api.get(`/pendaftaran/event/${selectedId}`);
        setPesertaByEvent((prev) => ({ ...prev, [selectedId]: r.data }));
      }
    } catch {
      toast.error('Gagal mengubah status');
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = (eventId: string) =>
    (pesertaByEvent[eventId] || []).filter((p) => p.status === 'PENDING').length;

  const statusStyle = (s: string) => ({
    PENDING:  { bg: '#fffbeb', color: '#d97706', label: 'Menunggu' },
    APPROVED: { bg: '#f0fdf4', color: '#059669', label: 'Diterima' },
    REJECTED: { bg: '#fef2f2', color: '#dc2626', label: 'Ditolak' },
  }[s] || { bg: '#f8fafc', color: '#94a3b8', label: s });

  const selectedEvent = events.find((e) => e.id === selectedId) || null;
  const peserta = selectedId ? (pesertaByEvent[selectedId] || []) : [];
  const filtered = useMemo(
    () => (filter === 'ALL' ? peserta : peserta.filter((p) => p.status === filter)),
    [peserta, filter],
  );
  const diterimaCount = peserta.filter((p) => p.status === 'APPROVED').length;
  const menungguCount = peserta.filter((p) => p.status === 'PENDING').length;

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _relFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .rel-event-item { transition: all 0.2s cubic-bezier(0.4,0,0.2,1) !important; }
        .rel-event-item:hover { transform: translateX(2px); }
        .rel-pcard { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .rel-pcard:hover { box-shadow: 0 10px 28px rgba(14,165,233,0.07) !important; }
        .rel-filter-btn { transition: all 0.2s ease !important; }
        .rel-btn { transition: all 0.2s ease !important; }
        .rel-btn:hover { transform: translateY(-1px) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '22px', animation: '_relFade 0.5s ease both' }}>
        <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: '600' }}>Admin</p>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>Verifikasi Relawan</h1>
        <p style={{ fontSize: '13.5px', color: '#7baac7', marginTop: '6px' }}>Pilih event di kiri, lalu terima atau tolak pendaftar langsung di sini.</p>
      </div>

      {loading ? (
        <p style={{ color: '#b0c8d8', fontSize: '14px' }}>Memuat...</p>
      ) : events.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(14,165,233,0.06)', padding: '56px', textAlign: 'center', color: '#7baac7', fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          Belum ada event
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Kolom kiri — daftar event */}
          <div style={{ flex: '1 1 280px', maxWidth: '320px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px', animation: '_relFade 0.5s ease 0.05s both' }}>
            {events.map((e) => {
              const aktif = e.id === selectedId;
              const pend = pendingCount(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => { setSelectedId(e.id); setFilter('ALL'); }}
                  className="rel-event-item"
                  style={{
                    textAlign: 'left', cursor: 'pointer', width: '100%',
                    background: aktif ? 'linear-gradient(135deg, #e0f2fe, #f0f9ff)' : '#fff',
                    border: aktif ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(14,165,233,0.06)',
                    borderRadius: '14px', padding: '14px 16px',
                    boxShadow: aktif ? '0 4px 16px rgba(14,165,233,0.1)' : '0 2px 10px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', lineHeight: 1.35 }}>{e.judul}</span>
                    {pend > 0 && (
                      <span style={{ flexShrink: 0, fontSize: '10.5px', fontWeight: '700', color: '#fff', background: 'linear-gradient(135deg,#f59e0b,#d97706)', padding: '3px 9px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(217,119,6,0.3)' }}>
                        {pend} menunggu
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: aktif ? '#0369a1' : '#7baac7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {e._count?.pendaftaran ?? (pesertaByEvent[e.id]?.length || 0)} pendaftar
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kolom kanan — panel verifikasi */}
          <div style={{ flex: '999 1 460px', minWidth: '300px', animation: '_relFade 0.5s ease 0.1s both' }}>
            {/* Panel header */}
            <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(14,165,233,0.06)', padding: '20px 22px', marginBottom: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.01em', marginBottom: '6px' }}>{selectedEvent?.judul}</h2>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '12.5px', color: '#7baac7', flexWrap: 'wrap' }}>
                    <span><b style={{ color: '#0c4a6e' }}>{peserta.length}</b> pendaftar</span>
                    <span style={{ color: '#d4e2ed' }}>·</span>
                    <span style={{ color: '#059669' }}><b>{diterimaCount}</b> diterima</span>
                    <span style={{ color: '#d4e2ed' }}>·</span>
                    <span style={{ color: '#d97706' }}><b>{menungguCount}</b> menunggu</span>
                  </div>
                </div>
                {selectedId && (
                  <Link href={`/dashboard/admin/events/${selectedId}/laporan`} className="rel-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(14,165,233,0.06)', color: '#0369a1', textDecoration: 'none', fontSize: '12.5px', fontWeight: '600', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                    Input Laporan
                  </Link>
                )}
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '3px', marginTop: '16px', background: 'linear-gradient(135deg, #f0f7ff, #fdfaf5)', padding: '4px', borderRadius: '11px', width: 'fit-content', maxWidth: '100%', flexWrap: 'wrap' }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className="rel-filter-btn" style={{
                    padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '12.5px', fontWeight: filter === f ? '600' : '500',
                    background: filter === f ? '#fff' : 'transparent',
                    color: filter === f ? '#0c4a6e' : '#7baac7',
                    boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  }}>
                    {{ ALL: 'Semua', PENDING: 'Menunggu', APPROVED: 'Diterima', REJECTED: 'Ditolak' }[f]}
                    <span style={{ marginLeft: '6px', fontSize: '11px', color: filter === f ? '#0ea5e9' : '#b0c8d8', fontWeight: '600' }}>
                      {f === 'ALL' ? peserta.length : peserta.filter((p) => p.status === f).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daftar pendaftar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#b0c8d8', fontSize: '13px', background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)' }}>
                  {peserta.length === 0 ? 'Belum ada pendaftar untuk event ini' : 'Tidak ada data pada filter ini'}
                </div>
              ) : filtered.map((p: any) => {
                const st = statusStyle(p.status);
                const busy = updatingId === p.id;
                return (
                  <div key={p.id} className="rel-pcard" style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', padding: '16px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#bae6fd,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(14,165,233,0.25)' }}>
                          {p.user?.nama?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a2332' }}>{p.user?.nama}</div>
                          <div style={{ fontSize: '12px', color: '#7baac7', marginTop: '2px' }}>{p.user?.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 11px', borderRadius: '20px', background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        {p.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => updateStatus(p.id, 'APPROVED')} disabled={busy} className="rel-btn" style={{ padding: '6px 16px', borderRadius: '9px', border: 'none', cursor: busy ? 'wait' : 'pointer', fontSize: '12.5px', fontWeight: '600', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: '#fff', boxShadow: '0 3px 10px rgba(14,165,233,0.25)', opacity: busy ? 0.6 : 1 }}>Terima</button>
                            <button onClick={() => updateStatus(p.id, 'REJECTED')} disabled={busy} className="rel-btn" style={{ padding: '6px 16px', borderRadius: '9px', border: '1.5px solid #fecaca', cursor: busy ? 'wait' : 'pointer', fontSize: '12.5px', fontWeight: '600', color: '#dc2626', background: '#fff', opacity: busy ? 0.6 : 1 }}>Tolak</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PBI #37 - Detail lengkap data pendaftaran */}
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(14,165,233,0.06)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                      {[
                        { label: 'NIK', value: p.nik },
                        { label: 'No. HP', value: p.noHp },
                        { label: 'Tgl. Lahir', value: p.tanggalLahir ? format(new Date(p.tanggalLahir), 'd MMM yyyy', { locale: id }) : '-' },
                      ].map((item, i) => (
                        <div key={i}>
                          <div style={{ fontSize: '10px', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{item.label}</div>
                          <div style={{ fontSize: '12.5px', color: '#4a6580' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fdfaf5', borderRadius: '9px' }}>
                      <div style={{ fontSize: '10px', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Motivasi</div>
                      <p style={{ fontSize: '12.5px', color: '#4a6580', lineHeight: 1.6 }}>{p.motivasi}</p>
                    </div>

                    {/* TASK 3 - Hasil form kesehatan */}
                    <div style={{ marginTop: '10px', padding: '12px', background: '#f8fbff', borderRadius: '9px', border: '1px solid rgba(14,165,233,0.08)' }}>
                      <div style={{ fontSize: '10px', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Form Kesehatan</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {KESEHATAN_LABELS.map((opt) => {
                          const dicentang = !!(p.kesehatan && (p.kesehatan as any)[opt.key]);
                          const wajib = KESEHATAN_WAJIB.includes(opt.key);
                          return (
                            <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: dicentang ? '#059669' : '#fef2f2', border: dicentang ? 'none' : '1px solid #fecaca' }}>
                                {dicentang
                                  ? <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                                  : <svg width="9" height="9" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                              </span>
                              <span style={{ fontSize: '12.5px', color: dicentang ? '#4a6580' : '#dc2626' }}>
                                {opt.label}
                                {wajib && <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 600, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '6px' }}>WAJIB</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* TASK 4 - Indikator ditolak otomatis karena kriteria kesehatan */}
                    {p.autoRejected && (
                      <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fef2f2', borderRadius: '9px', border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', marginBottom: '2px' }}>Ditolak otomatis oleh sistem</div>
                          <div style={{ fontSize: '11.5px', color: '#b91c1c', lineHeight: 1.5 }}>{p.alasanReject || 'Tidak memenuhi kriteria kesehatan wajib.'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
