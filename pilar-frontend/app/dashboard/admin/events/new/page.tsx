'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/ui/ImageUpload';

const errText: React.CSSProperties = { fontSize: '12px', color: '#dc2626', marginTop: '6px' };

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    judul: '', deskripsi: '', lokasi: '',
    tanggal: '', kuota: '50', gambar: '',
    tugasRelawan: '', kriteriaRelawan: '', perlengkapan: '', domisili: '',
  });

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  // TASK 2 - Validasi sisi client
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.judul.trim()) e.judul = 'Judul wajib diisi';
    if (!form.deskripsi.trim()) e.deskripsi = 'Deskripsi wajib diisi';
    if (!form.lokasi.trim()) e.lokasi = 'Lokasi wajib diisi';
    if (!form.tanggal) e.tanggal = 'Tanggal wajib diisi';
    else {
      const tgl = new Date(form.tanggal); const now = new Date();
      const tglOnly = new Date(tgl.getFullYear(), tgl.getMonth(), tgl.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (tglOnly < today) e.tanggal = 'Tanggal event tidak boleh di masa lalu';
    }
    if (!form.kuota || Number(form.kuota) < 1) e.kuota = 'Kuota minimal 1 relawan';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Periksa kembali data yang belum valid'); return; }
    setLoading(true);
    try {
      await api.post('/events', { ...form, kuota: Number(form.kuota) });
      toast.success('Event berhasil dibuat!');
      router.push('/dashboard/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat event');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Kelola Event</p>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0c4a6e', letterSpacing: '-0.02em' }}>Tambah Event Baru</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f5f0e8', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div>
              <label className="label">Judul Event</label>
              <input className="input" placeholder="Contoh: Bersih Pantai Kuta"
                value={form.judul} onChange={e => set('judul', e.target.value)}
                style={errors.judul ? { borderColor: '#dc2626' } : undefined}/>
              {errors.judul && <p style={errText}>{errors.judul}</p>}
            </div>

            <div>
              <label className="label">Deskripsi <span style={{ color: '#b0c8d8', fontWeight: 400 }}>(Tentang Event)</span></label>
              <textarea className="input" rows={4} placeholder="Deskripsikan kegiatan..."
                value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)}
                style={{ resize: 'none', ...(errors.deskripsi ? { borderColor: '#dc2626' } : {}) }}/>
              {errors.deskripsi && <p style={errText}>{errors.deskripsi}</p>}
            </div>

            <div>
              <label className="label">Lokasi</label>
              <input className="input" placeholder="Pantai Kuta, Bali"
                value={form.lokasi} onChange={e => set('lokasi', e.target.value)}
                style={errors.lokasi ? { borderColor: '#dc2626' } : undefined}/>
              {errors.lokasi && <p style={errText}>{errors.lokasi}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Tanggal & Waktu</label>
                <input className="input" type="datetime-local" min={new Date().toISOString().slice(0, 16)}
                  value={form.tanggal} onChange={e => set('tanggal', e.target.value)}
                  style={errors.tanggal ? { borderColor: '#dc2626' } : undefined}/>
                {errors.tanggal && <p style={errText}>{errors.tanggal}</p>}
              </div>
              <div>
                <label className="label">Kuota Relawan (jumlah dibutuhkan)</label>
                <input className="input" type="number" min="1"
                  value={form.kuota} onChange={e => set('kuota', e.target.value)}
                  style={errors.kuota ? { borderColor: '#dc2626' } : undefined}/>
                {errors.kuota && <p style={errText}>{errors.kuota}</p>}
              </div>
            </div>

            {/* TASK 6 - Detail kegiatan yang bisa diisi admin */}
            <div style={{ borderTop: '1px solid #f5f0e8', paddingTop: '18px', marginTop: '2px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Detail Kegiatan <span style={{ color: '#b0c8d8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opsional, tampil di halaman event)</span></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="label">Tugas Relawan</label>
                  <textarea className="input" rows={2} placeholder="Contoh: Memungut dan memilah sampah di area pantai..."
                    value={form.tugasRelawan} onChange={e => set('tugasRelawan', e.target.value)} style={{ resize: 'none' }}/>
                </div>
                <div>
                  <label className="label">Kriteria Relawan</label>
                  <textarea className="input" rows={2} placeholder="Contoh: Sehat jasmani, mampu berjalan di area pantai..."
                    value={form.kriteriaRelawan} onChange={e => set('kriteriaRelawan', e.target.value)} style={{ resize: 'none' }}/>
                </div>
                <div>
                  <label className="label">Perlengkapan</label>
                  <textarea className="input" rows={2} placeholder="Contoh: Sarung tangan (disediakan panitia), air minum..."
                    value={form.perlengkapan} onChange={e => set('perlengkapan', e.target.value)} style={{ resize: 'none' }}/>
                </div>
                <div>
                  <label className="label">Domisili</label>
                  <input className="input" placeholder="Contoh: Terbuka untuk semua daerah"
                    value={form.domisili} onChange={e => set('domisili', e.target.value)}/>
                </div>
              </div>
            </div>

            <ImageUpload
            value={form.gambar}
            onChange={url => set('gambar', url)}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button type="button" onClick={() => router.back()} className="btn-secondary">Batal</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Menyimpan...' : 'Simpan Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}