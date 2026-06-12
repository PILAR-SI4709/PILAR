'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

// TASK 3 - Label form kesehatan (selaras dengan form pendaftaran & backend)
const KESEHATAN_LABELS: { key: string; label: string }[] = [
  { key: 'tidakAdaPenyakitJantung', label: 'Tidak memiliki penyakit jantung' },
  { key: 'tidakAdaAsma', label: 'Tidak memiliki asma atau gangguan pernapasan' },
  { key: 'bisaBerjalanJauh', label: 'Mampu berjalan jauh lebih dari 2 km' },
  { key: 'tidakAlergiLaut', label: 'Tidak alergi terhadap lingkungan laut' },
  { key: 'tidakHamilAtauMenyusui', label: 'Tidak dalam kondisi hamil atau menyusui' },
];
// Pilihan wajib (harus dicentang) — ditandai khusus di UI admin
const KESEHATAN_WAJIB = ['bisaBerjalanJauh'];

export default function PesertaPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [peserta, setPeserta] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchData(); }, []);

  // #PBI16 - Lihat Peserta: Mengambil data event dan daftar peserta dari API
  // Catatan: kedua request di-handle terpisah supaya kegagalan salah satu
  // tidak membuat halaman ter-redirect ke dashboard (bug navigasi sebelumnya).
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');

    // 1. Ambil detail event. Hanya redirect jika event benar-benar tidak ada (404).
    try {
      const evRes = await api.get(`/events/${eventId}`);
      setEvent(evRes.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        toast.error('Event tidak ditemukan');
        router.push('/dashboard/admin/relawan');
        return;
      }
      setErrorMsg('Gagal memuat detail event. Coba muat ulang halaman.');
      setLoading(false);
      return;
    }

    // 2. Ambil daftar pendaftar. Jika gagal, tampilkan pesan error — JANGAN redirect.
    try {
      const pRes = await api.get(`/pendaftaran/event/${eventId}`);
      setPeserta(pRes.data);
    } catch {
      setErrorMsg('Gagal memuat daftar relawan. Coba muat ulang halaman.');
    } finally {
      setLoading(false);
    }
  };

  // #PBI17 - Update Status Partisipasi: Mengirim perubahan status (Terima/Tolak) ke API
  // #PBI18 - Validasi Peserta: Tombol Terima/Tolak di bawah adalah UI untuk memvalidasi peserta
  const updateStatus = async (pendaftaranId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/pendaftaran/${pendaftaranId}/status`, { status });
      toast.success(status === 'APPROVED' ? 'Relawan diterima' : 'Relawan ditolak');
      fetchData();
    } catch { toast.error('Gagal mengubah status'); }
  };

  const filtered = filter === 'ALL' ? peserta : peserta.filter(p => p.status === filter);

  const statusStyle = (s: string) => ({
    PENDING:  { bg: '#fffbeb', color: '#d97706', label: 'Menunggu' },
    APPROVED: { bg: '#f0fdf4', color: '#059669', label: 'Diterima' },
    REJECTED: { bg: '#fef2f2', color: '#dc2626', label: 'Ditolak' },
  }[s] || { bg: '#f8fafc', color: '#94a3b8', label: s });

  if (loading) return <DashboardLayout><div style={{ color: '#b0c8d8', fontSize: '14px' }}>Memuat...</div></DashboardLayout>;

return (
  <DashboardLayout>
    {/* SATU header saja — hapus yang satunya lagi */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
      <div>
        <p style={{ fontSize: '12px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Verifikasi Relawan</p>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>{event?.judul}</h1>
        <p style={{ fontSize: '13px', color: '#7baac7' }}>
          {peserta.length} pendaftar · {peserta.filter(p => p.status === 'APPROVED').length} diterima
        </p>
      </div>
      <Link href={`/dashboard/admin/events/${eventId}/laporan`}
        style={{ padding: '9px 16px', borderRadius: '10px', background: '#f0f9ff', color: '#0369a1', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
        Input Laporan
      </Link>
    </div>

      {errorMsg && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span>{errorMsg}</span>
          <button onClick={fetchData} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Muat Ulang</button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f5f0e8', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: '500',
            background: filter === f ? '#fff' : 'transparent',
            color: filter === f ? '#0c4a6e' : '#7baac7',
            boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
          }}>
            {{ ALL: 'Semua', PENDING: 'Menunggu', APPROVED: 'Diterima', REJECTED: 'Ditolak' }[f]}
            <span style={{ marginLeft: '6px', fontSize: '11px', color: '#b0c8d8' }}>
              {f === 'ALL' ? peserta.length : peserta.filter(p=>p.status===f).length}
            </span>
          </button>
        ))}
      </div>

      {/* List peserta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#b0c8d8', fontSize: '13px', background: '#fff', borderRadius: '14px', border: '1px solid #f5f0e8' }}>Tidak ada data</div>
        ) : filtered.map((p: any) => {
          const st = statusStyle(p.status);
          return (
            <div key={p.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f5f0e8', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#bae6fd,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
                    {p.user?.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a2332' }}>{p.user?.nama}</div>
                    <div style={{ fontSize: '12px', color: '#7baac7', marginTop: '2px' }}>{p.user?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                  {p.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => updateStatus(p.id, 'APPROVED')} style={{ padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500', background: '#0ea5e9', color: '#fff' }}>Terima</button>
                      <button onClick={() => updateStatus(p.id, 'REJECTED')} style={{ padding: '5px 14px', borderRadius: '8px', border: '1px solid #f5f0e8', cursor: 'pointer', fontSize: '12px', color: '#dc2626', background: '#fff' }}>Tolak</button>
                    </div>
                  )}
                </div>
              </div>

              {/* PBI #37 - Marshall Rasendria - Detail Lengkap Data Pendaftaran Peserta */}
              {/* Detail pendaftaran */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f5f0e8', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {[
                  { label: 'NIK', value: p.nik },
                  { label: 'No. HP', value: p.noHp },
                  { label: 'Tgl. Lahir', value: p.tanggalLahir ? format(new Date(p.tanggalLahir), 'd MMM yyyy', { locale: id }) : '-' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '10px', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: '#4a6580' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fdfaf5', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Motivasi</div>
                <p style={{ fontSize: '12px', color: '#4a6580', lineHeight: 1.6 }}>{p.motivasi}</p>
              </div>

              {/* TASK 3 - Hasil form kesehatan */}
              <div style={{ marginTop: '10px', padding: '12px', background: '#f8fbff', borderRadius: '8px', border: '1px solid rgba(14,165,233,0.08)' }}>
                <div style={{ fontSize: '10px', color: '#b0c8d8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Form Kesehatan</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {KESEHATAN_LABELS.map(opt => {
                    const dicentang = !!(p.kesehatan && (p.kesehatan as any)[opt.key]);
                    const wajib = KESEHATAN_WAJIB.includes(opt.key);
                    return (
                      <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: dicentang ? '#059669' : '#fef2f2', border: dicentang ? 'none' : '1px solid #fecaca' }}>
                          {dicentang
                            ? <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                            : <svg width="9" height="9" viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                        </span>
                        <span style={{ fontSize: '12px', color: dicentang ? '#4a6580' : '#dc2626' }}>
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
                <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
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
    </DashboardLayout>
  );
}