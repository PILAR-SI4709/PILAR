'use client';
// PBI #35 - Marshall Rasendria - Hub Manajemen Relawan Admin (Daftar Event + Link ke Peserta)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';

export default function AdminRelawanPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events').then(r => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '12px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Admin</p>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0c4a6e' }}>Verifikasi Relawan</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? <p style={{ color: '#b0c8d8', fontSize: '14px' }}>Memuat...</p> :
          events.map((e: any) => (
            <Link key={e.id} href={`/dashboard/admin/events/${e.id}/peserta`} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #f5f0e8', padding: '14px 18px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#0c4a6e' }}>{e.judul}</div>
              <div style={{ fontSize: '12px', color: '#0369a1' }}>{e._count?.pendaftaran || 0} pendaftar · Kelola</div>
            </Link>
          ))
        }
      </div>
    </DashboardLayout>
  );
}