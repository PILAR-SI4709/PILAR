'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { user, access_token } = res.data;

      setAuth(user, access_token);
      toast.success('Selamat datang, ' + user.nama.split(' ')[0] + '!');

      // Selalu kembali ke main page setelah login
      setTimeout(() => {
        window.location.href = '/';
      }, 600);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Email atau password salah');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Kiri — Panel Laut */}
      <div style={{
        display: 'none',
        width: '50%', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px',
        background: 'linear-gradient(160deg,#0c4a6e 0%,#0369a1 55%,#0ea5e9 100%)',
        position: 'relative', overflow: 'hidden',
      }} className="lg-panel">
        <style>{`@media(min-width:1024px){.lg-panel{display:flex!important}}`}</style>

        {/* Dekorasi lingkaran */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
          <svg viewBox="0 0 600 600" style={{ width: '100%', height: '100%' }}>
            <circle cx="300" cy="300" r="250" fill="none" stroke="white" strokeWidth="60"/>
            <circle cx="300" cy="300" r="150" fill="none" stroke="white" strokeWidth="40"/>
            <circle cx="300" cy="300" r="60" fill="white"/>
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 18c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M3 12c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: '600', fontSize: '15px', letterSpacing: '-0.02em' }}>PILAR</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'DM Serif Display,serif', fontSize: '40px', color: 'white', lineHeight: 1.2, marginBottom: '12px' }}>
            Peduli Laut,<br/>Peduli Pesisir
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: 1.6, maxWidth: '280px' }}>
            Bergabung bersama relawan dalam menjaga kebersihan laut dan pantai Indonesia.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}></div>
      </div>

      {/* Kanan — Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px', letterSpacing: '-0.02em' }}>Selamat datang</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Masuk ke akun PILAR kamu</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="email@kamu.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required/>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%' }}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#f5f0e8' }}/>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>atau</span>
            <div style={{ flex: 1, height: '1px', background: '#f5f0e8' }}/>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>
            <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Lanjutkan dengan Facebook
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '24px' }}>
            Belum punya akun?&nbsp;
            <Link href="/register" style={{ color: '#0369a1', fontWeight: '500', textDecoration: 'none' }}>Daftar sekarang</Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link href="/" style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'none' }}>Kembali ke beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
}