'use client';
// PBI #39 - Naufal Athalino - Detail Laporan Event (peserta hadir, sampah terkumpul, galeri dokumentasi)
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function LaporanDetailPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const [laporan, setLaporan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLaporan(); }, []);

  const fetchLaporan = async () => {
    try {
      const res = await api.get(`/laporan/${eventId}`);
      setLaporan(res.data);
    } catch { router.push('/dashboard'); }
    finally { setLoading(false); }
  };

  if (loading) return <DashboardLayout><div style={{ color: '#b0c8d8' }}>Memuat...</div></DashboardLayout>;
  if (!laporan) return null;

  const { event, ringkasan, peserta, dokumentasi, sampah } = laporan;

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _lapDFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .lapd-thumb { transition: all 0.25s ease !important; cursor: pointer; }
        .lapd-thumb:hover { transform: scale(1.03); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
      `}</style>
      <div style={{ maxWidth: '820px' }}>
        <div style={{ marginBottom: '24px', animation: '_lapDFade 0.5s ease both' }}>
          <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: '600' }}>Laporan Kegiatan</p>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>{event.judul}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#7baac7', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {event.lokasi}
            </span>
            <span style={{ color: '#d4e2ed' }}>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              {event.tanggal ? format(new Date(event.tanggal), 'd MMMM yyyy', { locale: id }) : '-'}
            </span>
          </div>
        </div>

        {/* Ringkasan */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
          {[
            { label: 'Peserta Hadir', value: ringkasan.totalPeserta, color: '#0369a1', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
            { label: 'Foto Dokumentasi', value: ringkasan.totalDokumentasi, color: '#059669', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg> },
            { label: 'Sampah (kg)', value: ringkasan.totalSampahKg.toLocaleString('id-ID'), color: '#d97706', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg> },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', padding: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', animation: `_lapDFade 0.4s ease ${0.06 * i}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(14,165,233,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
                <span style={{ fontSize: '11px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: s.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tentang Kegiatan */}
        {event.deskripsi && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', animation: '_lapDFade 0.5s ease 0.15s both' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', display: 'inline-block' }}/>
              Tentang Kegiatan
            </h2>
            <p style={{ fontSize: '13.5px', color: '#4a6580', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.deskripsi}</p>
          </div>
        )}

        {/* Data Sampah */}
        {sampah.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', animation: '_lapDFade 0.5s ease 0.2s both' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Rincian Sampah</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sampah.map((s: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fdfaf5', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#1a2332' }}>{s.jenis}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#0369a1' }}>{s.jumlahKg} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galeri Dokumentasi */}
        {dokumentasi.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', animation: '_lapDFade 0.5s ease 0.25s both' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', display: 'inline-block' }}/>
              Galeri Dokumentasi
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
              {dokumentasi.map((d: any) => (
                <a key={d.id} href={d.fotoUrl} target="_blank" rel="noopener noreferrer" className="lapd-thumb" style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '1', display: 'block' }}>
                  <img src={d.fotoUrl} alt={d.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}