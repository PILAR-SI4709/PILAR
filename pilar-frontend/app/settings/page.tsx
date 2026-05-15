'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [pwForm, setPwForm] = useState({ passwordLama: '', passwordBaru: '', konfirmasi: '' });
  const [loading, setLoading] = useState(false);
  const [toggles, setToggles] = useState([true, true]);

  const handleGantiPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.passwordBaru !== pwForm.konfirmasi) { toast.error('Konfirmasi password tidak cocok'); return; }
    if (pwForm.passwordBaru.length < 6) { toast.error('Password baru minimal 6 karakter'); return; }
    setLoading(true);
    try {
      await api.patch('/users/password', { passwordLama: pwForm.passwordLama, passwordBaru: pwForm.passwordBaru });
      toast.success('Password berhasil diubah');
      setPwForm({ passwordLama: '', passwordBaru: '', konfirmasi: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally { setLoading(false); }
  };

  // PBI #25 - M. Haiqal Akbar - Fungsionalitas Hapus Akun Relawan
  const handleHapusAkun = () => {
    if (!confirm('Yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan.')) return;
    toast.error('Fitur hapus akun belum tersedia. Hubungi admin.');
  };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _setFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .set-section { transition: all 0.3s ease !important; }
        .set-section:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.04) !important; }
        .set-input {
          width: 100%; padding: 11px 16px; border-radius: 12px;
          border: 1.5px solid rgba(14,165,233,0.1); background: #fff;
          font-size: 13.5px; font-family: inherit; color: #1a2332;
          transition: all 0.25s ease; outline: none; box-sizing: border-box;
        }
        .set-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 4px rgba(14,165,233,0.08); }
        .set-input::placeholder { color: #b0c8d8; }
        .set-btn-primary { transition: all 0.3s ease !important; }
        .set-btn-primary:hover:not(:disabled) { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(14,165,233,0.3) !important; }
        .set-btn-danger { transition: all 0.25s ease !important; }
        .set-btn-danger:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 16px rgba(220,38,38,0.15) !important; background: #fef2f2 !important; }
      `}</style>

      <div style={{ maxWidth: '560px', animation: '_setFade 0.5s ease both' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', fontWeight: '600' }}>Akun</p>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0c4a6e' }}>Pengaturan</h1>
        </div>

        {/* Ganti Password */}
        <div className="set-section" style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(14,165,233,0.06)', padding: '28px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: '_setFade 0.5s ease 0.1s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ganti Password</h2>
          </div>
          <form onSubmit={handleGantiPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'passwordLama', label: 'Password Saat Ini' },
              { key: 'passwordBaru', label: 'Password Baru' },
              { key: 'konfirmasi', label: 'Konfirmasi Password Baru' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0c4a6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                <input className="set-input" type="password" placeholder="••••••••"
                  value={(pwForm as any)[f.key]}
                  onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required/>
              </div>
            ))}
            <div style={{ paddingTop: '6px' }}>
              <button type="submit" disabled={loading} className="set-btn-primary" style={{ padding: '10px 22px', borderRadius: '10px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}>
                {loading ? 'Menyimpan...' : 'Ganti Password'}
              </button>
            </div>
          </form>
        </div>

        {/* PBI #25 - M. Haiqal Akbar - Fungsionalitas Hapus Akun Relawan */}
        <div className="set-section" style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(220,38,38,0.08)', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: '_setFade 0.5s ease 0.3s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #fee2e2, #fecaca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zona Bahaya</h2>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '18px', lineHeight: 1.7 }}>
            Menghapus akun akan menghilangkan seluruh data riwayat pendaftaran dan sertifikat secara permanen.
          </p>
          <button onClick={handleHapusAkun} className="set-btn-danger" style={{ padding: '10px 20px', borderRadius: '10px', background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Hapus Akun Saya
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}