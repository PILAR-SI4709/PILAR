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

  const handleGantiPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.passwordBaru !== pwForm.konfirmasi) {
      toast.error('Konfirmasi password tidak cocok'); return;
    }
    if (pwForm.passwordBaru.length < 6) {
      toast.error('Password baru minimal 6 karakter'); return;
    }
    setLoading(true);
    try {
      await api.patch('/users/password', {
        passwordLama: pwForm.passwordLama,
        passwordBaru: pwForm.passwordBaru,
      });
      toast.success('Password berhasil diubah');
      setPwForm({ passwordLama: '', passwordBaru: '', konfirmasi: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally { setLoading(false); }
  };

  const handleHapusAkun = () => {
    if (!confirm('Yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan.')) return;
    toast.error('Fitur hapus akun belum tersedia. Hubungi admin.');
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f5f0e8', padding: '24px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>{title}</h2>
      {children}
    </div>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '520px' }}>
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', color: '#7baac7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Akun</p>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0c4a6e' }}>Pengaturan</h1>
        </div>

        <Section title="Ganti Password">
          <form onSubmit={handleGantiPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'passwordLama', label: 'Password Saat Ini' },
              { key: 'passwordBaru', label: 'Password Baru' },
              { key: 'konfirmasi', label: 'Konfirmasi Password Baru' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input className="input" type="password" placeholder="••••••••"
                  value={(pwForm as any)[f.key]}
                  onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required/>
              </div>
            ))}
            <div style={{ paddingTop: '4px' }}>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Menyimpan...' : 'Ganti Password'}
              </button>
            </div>
          </form>
        </Section>

        <Section title="Notifikasi">
          {[
            { label: 'Email konfirmasi pendaftaran event', desc: 'Kirim email saat pendaftaran diterima atau ditolak' },
            { label: 'Pengingat event', desc: 'Notifikasi H-1 sebelum event berlangsung' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === 0 ? '1px solid #f5f0e8' : 'none' }}>
              <div>
                <div style={{ fontSize: '13.5px', color: '#1a2332', marginBottom: '2px' }}>{n.label}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{n.desc}</div>
              </div>
              <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: '#e0f2fe', cursor: 'pointer', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '3px', top: '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#0ea5e9' }}/>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Zona Bahaya">
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
            Menghapus akun akan menghilangkan seluruh data riwayat pendaftaran dan sertifikat secara permanen.
          </p>
          <button onClick={handleHapusAkun} style={{ padding: '9px 18px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            Hapus Akun Saya
          </button>
        </Section>
      </div>
    </DashboardLayout>
  );
}