'use client';
// PBI #40 - Naufal Athalino - Halaman Rekap Statistik Keseluruhan Program
// Ringkasan agregat seluruh event (total sampah, relawan aktif, event selesai)
// agar admin dapat mengevaluasi capaian program secara keseluruhan.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function MonitoringPage() {
  const { user, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [rekap, setRekap] = useState({ totalSampahKg: 0, totalRelawanAktif: 0, totalEventSelesai: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
    api.get('/events/rekap').then(r => setRekap(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/dashboard');
  }, [user]);

  const cards = [
    {
      label: 'Total Sampah Terkumpul',
      value: `${rekap.totalSampahKg.toLocaleString('id-ID')} kg`,
      color: '#d97706',
      gradient: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    },
    {
      label: 'Total Relawan Aktif',
      value: rekap.totalRelawanAktif.toLocaleString('id-ID'),
      color: '#059669',
      gradient: 'linear-gradient(135deg, #dcfce7, #f0fdf4)',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      label: 'Total Event Selesai',
      value: rekap.totalEventSelesai.toLocaleString('id-ID'),
      color: '#0369a1',
      gradient: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    },
  ];

  if (loading) return <DashboardLayout><div style={{ color: '#b0c8d8', fontSize: '14px' }}>Memuat...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _monFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .mon-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .mon-card:hover { transform: translateY(-5px) !important; box-shadow: 0 12px 32px rgba(14,165,233,0.12) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px', animation: '_monFade 0.5s ease both' }}>
        <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: '600' }}>Monitoring Program</p>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>Rekap Statistik Keseluruhan</h1>
        <p style={{ fontSize: '13.5px', color: '#7baac7', marginTop: '8px', maxWidth: '560px', lineHeight: 1.6 }}>
          Ringkasan capaian seluruh program dari semua event untuk evaluasi menyeluruh.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px' }}>
        {cards.map((c, i) => (
          <div key={i} className="mon-card" style={{
            background: '#fff', borderRadius: '20px',
            border: '1px solid rgba(14,165,233,0.06)', padding: '26px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            animation: `_monFade 0.5s ease ${0.1 * (i + 1)}s both`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-14px', right: '-14px', width: '76px', height: '76px', borderRadius: '50%', background: c.gradient, opacity: 0.5, pointerEvents: 'none' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.icon}
              </div>
              <div style={{ fontSize: '11px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>{c.label}</div>
            </div>
            <div style={{ fontSize: '42px', fontWeight: '700', color: c.color, lineHeight: 1, letterSpacing: '-0.03em' }}>{c.value}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
