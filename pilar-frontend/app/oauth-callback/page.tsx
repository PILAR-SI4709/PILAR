'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

function CallbackHandler() {
  const params = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token   = params.get('token');
    const userStr = params.get('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth(user, token);
        window.location.href = '/';
      } catch {
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#fdfaf5',
    }}>
      <div style={{textAlign:'center'}}>
        <div style={{
          width:'48px', height:'48px', borderRadius:'50%',
          border:'3px solid #f0f9ff', borderTop:'3px solid #0ea5e9',
          margin:'0 auto 16px', animation:'spin 0.8s linear infinite',
        }}/>
        <p style={{fontSize:'14px', color:'#7baac7'}}>Memproses login...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}