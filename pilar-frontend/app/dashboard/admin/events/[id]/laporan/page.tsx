'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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

  // PBI #31 - Feyza Adyani - Form Input Data Sampah Per Event
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

  // PBI #31 - Feyza Adyani - Form Input Data Sampah Per Event (hapus entri)
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

  // PBI #32 - Feyza Adyani - Upload Foto Dokumentasi Kegiatan oleh Admin
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

  // PBI #33 - Feyza Adyani - Hapus Foto Dokumentasi dari Galeri Admin
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
      <style>{`
        @keyframes _lapFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .lap-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .lap-card:hover { box-shadow: 0 12px 32px rgba(14,165,233,0.08) !important; }
        .lap-thumb { transition: all 0.25s ease !important; }
        .lap-thumb:hover { transform: scale(1.03); }
      `}</style>
      <div style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', animation: '_lapFade 0.5s ease both' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: '600' }}>Input Laporan Kegiatan</p>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em', marginBottom: '6px' }}>{event?.judul}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#7baac7', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {event?.lokasi || '-'}
              </span>
              <span style={{ color: '#d4e2ed' }}>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                {event?.tanggal ? format(new Date(event.tanggal), 'd MMM yyyy', { locale: id }) : '-'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <Link href={`/dashboard/admin/relawan?event=${eventId}`} style={{ padding: '9px 16px', borderRadius: '10px', background: '#f8fafc', color: '#4a6580', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Relawan</Link>
            <Link href={`/laporan/${eventId}`} style={{ padding: '9px 16px', borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}>Lihat Laporan</Link>
          </div>
        </div>

        {/* Ringkasan stat */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Relawan Diterima', value: (event?.relawanDiterima ?? 0).toString(), color: '#0369a1', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { label: 'Total Sampah', value: `${totalSampah.toLocaleString('id-ID')} kg`, color: '#059669', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> },
            { label: 'Foto Dokumentasi', value: dokList.length.toString(), color: '#d97706', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg> },
          ].map((s, i) => (
            <div key={i} className="lap-card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(14,165,233,0.06)', padding: '16px 18px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', animation: `_lapFade 0.4s ease ${0.06 * i}s both` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(14,165,233,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
                <span style={{ fontSize: '11px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: s.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: '_lapFade 0.5s ease 0.1s both' }}>

          {/* PBI #31 - Feyza Adyani - Form Input Data Sampah Per Event */}
          {/* Kiri — Input Sampah */}
          <div>
            <div className="lap-card" style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(14,165,233,0.06)', padding: '22px', marginBottom: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
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
            <div className="lap-card" style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(14,165,233,0.06)', padding: '22px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
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

          {/* PBI #32 - Feyza Adyani - Upload Foto Dokumentasi Kegiatan */}
          {/* PBI #33 - Feyza Adyani - Hapus Foto Dokumentasi dari Galeri */}
          {/* Kanan — Upload Dokumentasi */}
          <div>
            <div className="lap-card" style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(14,165,233,0.06)', padding: '22px', marginBottom: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
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
            <div className="lap-card" style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(14,165,233,0.06)', padding: '22px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                Galeri ({dokList.length} foto)
              </h2>
              {dokList.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#b0c8d8', textAlign: 'center', padding: '16px 0' }}>Belum ada foto</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                  {dokList.map((d: any) => (
                    <div key={d.id} className="lap-thumb" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1' }}>
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