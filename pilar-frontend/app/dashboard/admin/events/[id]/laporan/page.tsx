'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const jenisSampah = ['Plastik', 'Kaca', 'Logam', 'Organik', 'Kertas', 'Kain', 'Lainnya'];

export default function AdminLaporanEventPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<any>(null);
  const [sampahList, setSampahList] = useState<any[]>([]);
  const [dokList, setDokList] = useState<any[]>([]);

  const [sampahForm, setSampahForm] = useState({ jenis: 'Plastik', jumlahKg: '', catatan: '' });
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingSampah, setSavingSampah] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [evRes, sRes, dRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/sampah/event/${eventId}`),
        api.get(`/dokumentasi/event/${eventId}`),
      ]);
      setEvent(evRes.data);
      setSampahList(sRes.data.items || []);
      setDokList(dRes.data);
    } catch { router.push('/dashboard/admin'); }
  };

  const handleAddSampah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampahForm.jumlahKg || Number(sampahForm.jumlahKg) <= 0) {
      toast.error('Masukkan jumlah sampah yang valid'); return;
    }
    setSavingSampah(true);
    try {
      await api.post('/sampah', {
        eventId,
        jenis: sampahForm.jenis,
        jumlahKg: Number(sampahForm.jumlahKg),
        catatan: sampahForm.catatan,
      });
      toast.success('Data sampah ditambahkan!');
      setSampahForm({ jenis: 'Plastik', jumlahKg: '', catatan: '' });
      fetchData();
    } catch { toast.error('Gagal menyimpan data sampah'); }
    finally { setSavingSampah(false); }
  };

  const handleDeleteSampah = async (id: string) => {
    try {
      await api.delete(`/sampah/${id}`);
      toast.success('Data dihapus');
      fetchData();
    } catch { toast.error('Gagal menghapus'); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleUploadDok = async () => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) { toast.error('Pilih foto terlebih dahulu'); return; }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('foto', file);
        fd.append('eventId', eventId as string);
        fd.append('caption', caption);
        await api.post('/dokumentasi/upload-admin', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success(`${files.length} foto berhasil diunggah!`);
      setCaption('');
      setPreviews([]);
      if (fileRef.current) fileRef.current.value = '';
      fetchData();
    } catch { toast.error('Gagal upload foto'); }
    finally { setUploading(false); }
  };

  const handleDeleteDok = async (id: string) => {
    try {
      await api.delete(`/dokumentasi/${id}`);
      toast.success('Foto dihapus');
      fetchData();
    } catch { toast.error('Gagal menghapus foto'); }
  };

  const totalSampah = sampahList.reduce((s, i) => s + i.jumlahKg, 0);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Input Laporan</p>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0c4a6e', letterSpacing: '-0.02em' }}>{event?.judul}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Kiri — Input Sampah */}
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f5f0e8', padding: '20px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Input Data Sampah</h2>
              <form onSubmit={handleAddSampah} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="label">Jenis Sampah</label>
                  <select className="input" value={sampahForm.jenis} onChange={e => setSampahForm(p => ({ ...p, jenis: e.target.value }))}>
                    {jenisSampah.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Jumlah (kg)</label>
                  <input className="input" type="number" step="0.1" min="0.1" placeholder="0.0"
                    value={sampahForm.jumlahKg} onChange={e => setSampahForm(p => ({ ...p, jumlahKg: e.target.value }))}/>
                </div>
                <div>
                  <label className="label">Catatan <span style={{ color: '#b0c8d8', fontWeight: '400' }}>(opsional)</span></label>
                  <input className="input" placeholder="Contoh: botol plastik bekas"
                    value={sampahForm.catatan} onChange={e => setSampahForm(p => ({ ...p, catatan: e.target.value }))}/>
                </div>
                <button type="submit" disabled={savingSampah} className="btn-primary">
                  {savingSampah ? 'Menyimpan...' : 'Tambah Data'}
                </button>
              </form>
            </div>

            {/* List sampah */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f5f0e8', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Data Sampah</h2>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1' }}>Total: {totalSampah.toLocaleString('id-ID')} kg</span>
              </div>
              {sampahList.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#b0c8d8', textAlign: 'center', padding: '16px 0' }}>Belum ada data</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sampahList.map((s: any) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#fdfaf5', borderRadius: '10px' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a2332' }}>{s.jenis}</span>
                        {s.catatan && <span style={{ fontSize: '11px', color: '#b0c8d8', marginLeft: '6px' }}>{s.catatan}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#0369a1' }}>{s.jumlahKg} kg</span>
                        <button onClick={() => handleDeleteSampah(s.id)} style={{ fontSize: '11px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kanan — Upload Dokumentasi */}
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f5f0e8', padding: '20px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Upload Dokumentasi</h2>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); if (fileRef.current) { fileRef.current.files = e.dataTransfer.files; handleFileSelect({ target: fileRef.current } as any); } }}
                onDragOver={e => e.preventDefault()}
                style={{ border: '2px dashed #e8dcc8', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#fdfaf5', marginBottom: '12px' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b0c8d8" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <p style={{ fontSize: '13px', color: '#7baac7', marginBottom: '4px' }}>Klik atau seret foto ke sini</p>
                <p style={{ fontSize: '11px', color: '#b0c8d8' }}>Bisa pilih beberapa foto sekaligus — maks. 10MB per foto</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect}/>

              {/* Preview */}
              {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '12px' }}>
                  {previews.map((p, i) => (
                    <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                      <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label className="label">Caption <span style={{ color: '#b0c8d8', fontWeight: '400' }}>(opsional)</span></label>
                <input className="input" placeholder="Deskripsi foto..." value={caption} onChange={e => setCaption(e.target.value)}/>
              </div>

              <button onClick={handleUploadDok} disabled={uploading || previews.length === 0} className="btn-primary" style={{ width: '100%' }}>
                {uploading ? 'Mengunggah...' : `Upload ${previews.length > 0 ? previews.length + ' Foto' : 'Foto'}`}
              </button>
            </div>

            {/* Galeri yang sudah diupload */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f5f0e8', padding: '20px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                Galeri ({dokList.length} foto)
              </h2>
              {dokList.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#b0c8d8', textAlign: 'center', padding: '16px 0' }}>Belum ada foto</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                  {dokList.map((d: any) => (
                    <div key={d.id} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1' }}>
                      <img src={d.fotoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={d.caption || ''}/>
                      <button onClick={() => handleDeleteDok(d.id)} style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(220,38,38,0.85)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}