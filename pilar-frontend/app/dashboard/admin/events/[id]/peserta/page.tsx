'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export default function PesertaPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [peserta, setPeserta] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [evRes, pRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/pendaftaran/event/${eventId}`),
      ]);
      setEvent(evRes.data);
      setPeserta(pRes.data);
    } catch { router.push('/dashboard/admin'); }
    finally { setLoading(false); }
  };

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
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}