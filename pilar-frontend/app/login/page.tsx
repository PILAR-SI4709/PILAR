'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { user, access_token } = res.data;
      setAuth(user, access_token);
      toast.success('Selamat datang, ' + user.nama.split(' ')[0] + '!');
      setTimeout(() => { window.location.href = '/'; }, 600);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Email atau password salah');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @media(min-width:1024px){ .lg-panel{ display:flex !important; } }

        @keyframes _fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes _slideRight {
          from { opacity:0; transform:translateX(-20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes _float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes _pulse { 0%,100% { opacity:0.07; } 50% { opacity:0.12; } }

        .login-form-wrap { animation: _fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }

        .login-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid rgba(14,165,233,0.1); background: #fff;
          font-size: 13.5px; font-family: inherit; color: #1a2332;
          transition: all 0.25s ease;
          outline: none;
        }
        .login-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 4px rgba(14,165,233,0.08);
        }
        .login-input::placeholder { color: #b0c8d8; }

        .login-btn {
          width: 100%; padding: 13px 16px; border-radius: 12px;
          border: none; cursor: pointer;
          background: linear-gradient(135deg,#0ea5e9,#0369a1);
          color: #fff; font-size: 14px; font-weight: 600;
          font-family: inherit; letter-spacing: -0.01em;
          box-shadow: 0 4px 16px rgba(14,165,233,0.25);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(14,165,233,0.35);
        }
        .login-btn:active { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.7; cursor: wait; }

        .google-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid rgba(14,165,233,0.1); background: #fff;
          color: #1a2332; text-decoration: none;
          font-size: 13.5px; font-weight: 500; font-family: inherit;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .google-btn:hover {
          border-color: rgba(14,165,233,0.2);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .google-btn:active { transform: translateY(0); transition-duration: 0.08s; }
      `}</style>

      {/* Kiri — Panel Laut */}
      <div
        className="lg-panel"
        style={{
          display: 'none', width: '50%',
          flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px',
          backgroundImage: 'url(/pantai-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(12,74,110,0.55) 0%, rgba(3,105,161,0.35) 55%, rgba(14,165,233,0.2) 100%)' }}/>

        {/* Logo */}
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'10px', animation: '_slideRight 0.6s ease both' }}>
          <div style={{
            width:'32px', height:'32px', borderRadius:'10px',
            background:'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 18c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M3 12c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <span style={{ color:'white', fontWeight:'700', fontSize:'16px', letterSpacing:'-0.02em' }}>PILAR</span>
        </div>

        {/* Teks tengah */}
        <div style={{ position:'relative', zIndex:1, animation: '_slideRight 0.8s ease 0.2s both' }}>
          <h1 style={{
            fontFamily:'DM Serif Display,serif', fontSize:'44px',
            color:'white', lineHeight:1.15, marginBottom:'16px',
          }}>
            Peduli Laut,<br/>Peduli Pesisir
          </h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'15px', lineHeight:1.7, maxWidth:'300px' }}>
            Bergabung bersama ribuan relawan dalam menjaga kebersihan laut dan pantai Indonesia.
          </p>
        </div>

        <div style={{ position:'relative', zIndex:1 }}/>
      </div>

      {/* Kanan — Form */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        padding:'32px 24px', background:'linear-gradient(180deg, #fff, #f8fbff)',
      }}>
        <div className="login-form-wrap" style={{ width:'100%', maxWidth:'380px' }}>

          {/* Header */}
          <div style={{ marginBottom:'32px' }}>
            <h2 style={{
              fontSize:'24px', fontWeight:'700', color:'#0c4a6e',
              marginBottom:'6px', letterSpacing:'-0.02em',
            }}>Selamat datang</h2>
            <p style={{ fontSize:'14px', color:'#7baac7' }}>Masuk ke akun PILAR kamu</p>
          </div>

          {/* Form email + password */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0c4a6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <input
                type="email"
                className="login-input"
                placeholder="email@kamu.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div style={{ marginBottom:'22px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0c4a6e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <input
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading
                ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                    <span style={{
                      width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.4)',
                      borderTop:'2px solid #fff', borderRadius:'50%',
                      animation:'spin 0.7s linear infinite', flexShrink:0,
                    }}/>
                    Masuk...
                  </span>
                : 'Masuk'
              }
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'24px 0' }}>
            <div style={{ flex:1, height:'1px', background:'rgba(14,165,233,0.08)' }}/>
            <span style={{ fontSize:'12px', color:'#b0c8d8', fontWeight:'500' }}>atau</span>
            <div style={{ flex:1, height:'1px', background:'rgba(14,165,233,0.08)' }}/>
          </div>

          {/* Tombol Google */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api','') || 'http://localhost:3001'}/api/auth/google`}
            className="google-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </a>

          {/* Footer links */}
          <p style={{ textAlign:'center', fontSize:'13px', color:'#7baac7', marginTop:'28px' }}>
            Belum punya akun?&nbsp;
            <Link href="/register" style={{ color:'#0ea5e9', fontWeight:'600', textDecoration:'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
              onMouseLeave={e => (e.currentTarget.style.color = '#0ea5e9')}
            >
              Daftar sekarang
            </Link>
          </p>
          <p style={{ textAlign:'center', marginTop:'10px' }}>
            <Link href="/" style={{ fontSize:'12px', color:'#b0c8d8', textDecoration:'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7baac7')}
              onMouseLeave={e => (e.currentTarget.style.color = '#b0c8d8')}
            >
              ← Kembali ke beranda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
