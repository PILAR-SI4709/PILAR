'use client';
import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { loadFromStorage, setAuth, token } = useAuthStore();
  const [stats, setStats] = useState({ totalEvent: 0, totalSampahKg: 0 });
  const [form, setForm] = useState({ nama: '', bio: '', noHp: '' });
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [preview, setPreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFromStorage();
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      const data = res.data;
      setProfileData(data);
      setPreview(data.foto || '');
      setForm({ nama: data.nama || '', bio: data.bio || '', noHp: data.noHp || '' });
    } catch {}
  };

  const fetchStats = async () => {
    try { const res = await api.get('/users/stats'); setStats(res.data); } catch {}
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Ukuran foto maks. 2MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return; }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const res = await api.post('/users/upload-foto', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (token) setAuth(res.data.user, token);
      setProfileData((prev: any) => ({ ...prev, foto: res.data.url }));
      setPreview(res.data.url);
      toast.success('Foto profil diperbarui!');
    } catch {
      toast.error('Gagal upload foto');
      setPreview(profileData?.foto || '');
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.patch('/users/profile', form);
      setProfileData(res.data);
      if (token) setAuth(res.data, token);
      toast.success('Profil berhasil diperbarui');
      setEdit(false);
    } catch { toast.error('Gagal memperbarui profil'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _profFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .prof-card { transition: all 0.3s ease !important; }
        .prof-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.04) !important; }
        .prof-avatar-wrap { position: relative; cursor: pointer; }
        .prof-avatar-wrap:hover .prof-avatar-overlay { opacity: 1 !important; }
        .prof-input {
          width: 100%; padding: 11px 16px; border-radius: 12px;
          border: 1.5px solid rgba(14,165,233,0.1); background: #fff;
          font-size: 13.5px; font-family: inherit; color: #1a2332;
          transition: all 0.25s ease; outline: none; box-sizing: border-box;
        }
        .prof-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 4px rgba(14,165,233,0.08); }
        .prof-btn-save { transition: all 0.3s ease !important; }
        .prof-btn-save:hover:not(:disabled) { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(14,165,233,0.3) !important; }
        .prof-stat { transition: all 0.3s ease !important; }
        .prof-stat:hover { transform: translateY(-2px) !important; }
      `}</style>

      <div style={{ maxWidth: '640px', animation: '_profFade 0.5s ease both' }}>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: '600' }}>Akun</p>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>Profil Saya</h1>
        </div>

        {/* Card foto + stats */}
        <div className="prof-card" style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(14,165,233,0.06)', padding: '28px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: '_profFade 0.5s ease 0.1s both', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative gradient */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc, #38bdf8, #0ea5e9)', backgroundSize: '200% auto' }}/>

          {/* Avatar */}
          <div className="prof-avatar-wrap" onClick={() => fileRef.current?.click()} style={{ flexShrink: 0 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#fff', overflow: 'hidden', boxShadow: '0 6px 20px rgba(14,165,233,0.25)' }}>
              {preview
                ? <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profil"/>
                : profileData?.nama?.charAt(0).toUpperCase()
              }
            </div>
            <div className="prof-avatar-overlay" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: uploading ? 1 : 0, transition: 'opacity 0.25s', backdropFilter: 'blur(2px)' }}>
              {uploading ? (
                <div style={{ width: '20px', height: '20px', border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange}/>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.01em' }}>{profileData?.nama}</div>
            <div style={{ fontSize: '13px', color: '#7baac7', marginTop: '3px' }}>{profileData?.email}</div>
            <button onClick={() => fileRef.current?.click()} style={{ marginTop: '10px', fontSize: '12px', color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
              onMouseLeave={e => (e.currentTarget.style.color = '#0ea5e9')}
            >
              {uploading ? 'Mengunggah...' : 'Ganti foto profil'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Event Diikuti', value: stats.totalEvent, color: '#0369a1' },
              { label: 'Sampah (kg)', value: stats.totalSampahKg.toLocaleString('id-ID'), color: '#059669' },
            ].map((s, i) => (
              <div key={i} className="prof-stat" style={{ textAlign: 'center', padding: '10px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, #f8fbff, #fdfaf5)' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#7baac7', marginTop: '3px', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form edit */}
        <div className="prof-card" style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(14,165,233,0.06)', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: '_profFade 0.5s ease 0.2s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Informasi Profil</h2>
            {!edit && <button onClick={() => setEdit(true)} style={{ fontSize: '12px', color: '#0ea5e9', background: 'rgba(14,165,233,0.06)', border: 'none', cursor: 'pointer', fontWeight: '600', padding: '5px 14px', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.06)')}
            >Edit</button>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { key: 'nama', label: 'Nama Lengkap', type: 'text', ph: 'Nama kamu' },
              { key: 'noHp', label: 'Nomor HP', type: 'tel', ph: '08xxxxxxxxxx' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0c4a6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                {edit
                  ? <input className="prof-input" type={f.type} placeholder={f.ph}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}/>
                  : <p style={{ fontSize: '14px', color: '#1a2332', padding: '10px 0', fontWeight: '500' }}>{(form as any)[f.key] || <span style={{ color: '#b0c8d8' }}>-</span>}</p>
                }
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0c4a6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <p style={{ fontSize: '14px', color: '#94a3b8', padding: '10px 0' }}>{profileData?.email}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0c4a6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bio</label>
              {edit
                ? <textarea className="prof-input" rows={3} placeholder="Ceritakan tentang dirimu..."
                    value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    style={{ resize: 'none' }}/>
                : <p style={{ fontSize: '14px', color: '#1a2332', padding: '10px 0', lineHeight: 1.6, fontWeight: '500' }}>{form.bio || <span style={{ color: '#b0c8d8' }}>-</span>}</p>
              }
            </div>
          </div>

          {edit && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setEdit(false)} style={{ padding: '9px 20px', borderRadius: '10px', border: '1.5px solid rgba(14,165,233,0.1)', background: '#fff', color: '#4a6580', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(14,165,233,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(14,165,233,0.1)')}
              >Batal</button>
              <button onClick={handleSave} disabled={loading} className="prof-btn-save" style={{ padding: '9px 22px', borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
