'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/ui/ImageUpload';

export default function EditEventPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    judul: '', deskripsi: '', lokasi: '',
    tanggal: '', kuota: '50', gambar: '', status: 'UPCOMING',
  });

  useEffect(() => { fetchEvent(); }, []);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      const e = res.data;
      setForm({
        judul: e.judul, deskripsi: e.deskripsi, lokasi: e.lokasi,
        tanggal: e.tanggal ? new Date(e.tanggal).toISOString().slice(0, 16) : '',
        kuota: String(e.kuota), gambar: e.gambar || '', status: e.status,
      });
    } catch { router.push('/dashboard/admin'); }
  };

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/events/${eventId}`, { ...form, kuota: Number(form.kuota) });
      toast.success('Event berhasil diperbarui!');
      router.push('/dashboard/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui event');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Kelola Event</p>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0c4a6e', letterSpacing: '-0.02em' }}>Edit Event</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f5f0e8', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="label">Judul Event</label>
              <input className="input" value={form.judul} onChange={e => set('judul', e.target.value)} required/>
            </div>
            <div>
              <label className="label">Deskripsi</label>
              <textarea className="input" rows={4} value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)} style={{ resize: 'none' }} required/>
            </div>
            <div>
              <label className="label">Lokasi</label>
              <input className="input" value={form.lokasi} onChange={e => set('lokasi', e.target.value)} required/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Tanggal & Waktu</label>
                <input className="input" type="datetime-local" value={form.tanggal} onChange={e => set('tanggal', e.target.value)} required/>
              </div>
              <div>
                <label className="label">Kuota</label>
                <input className="input" type="number" min="1" value={form.kuota} onChange={e => set('kuota', e.target.value)} required/>
              </div>
            </div>
            <div>
              <label className="label">Status Event</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="UPCOMING">Mendatang</option>
                <option value="ONGOING">Sedang Berlangsung</option>
                <option value="DONE">Selesai</option>
              </select>
            </div>
            <ImageUpload
            value={form.gambar}
            onChange={url => set('gambar', url)}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}