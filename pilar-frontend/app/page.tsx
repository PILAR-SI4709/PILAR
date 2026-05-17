'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Dock, DockIcon } from '@/components/ui/dock';

export default function MainPage() {
  const { user, logout, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvent: 0, totalRelawan: 0, totalSampahKg: 0 });
  const [loadingEvents, setLoadingEvents] = useState(true);
  const waveBackRef = useRef<SVGPathElement>(null);
  const waveFrontRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
    fetchData();
  }, []);

  // GSAP wave morph transition: hero → about us (swipes blue wave bottom → top)
  useEffect(() => {
    // Always land at the top on mount. When users navigate back from
    // /dashboard or /profile, the browser restores the previous scroll
    // position — but the hero is pinned at scroll 0–80vh, so restored
    // mid-scroll positions land in the blank pin-spacer zone.
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }

    // Cancellation flag — protects against a fast mount→unmount→mount race
    // (React Strict Mode, Next.js route transitions) where a stale async
    // setup would finish after cleanup and create a duplicate pin-spacer,
    // producing the "hero rendered twice" glitch.
    let cancelled = false;
    let ctx: any;
    let cleanupFn: (() => void) | undefined;
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // Single wave band — wavy top AND wavy bottom, with amplitude that ramps
      // up on entry and decays on exit so the wave doesn't pop in/out.
      // Command structure (M, C, C, L, C, C, Z) stays identical across states
      // so GSAP's attr plugin morphs every number smoothly.
      const buildStates = (amp: number, phase: number) => {
        // [topY, bottomY, amplitudeMultiplier] per state.
        // Tuned so the wave keeps covering the hero↔tentang seam through
        // the hero scroll-off, and is fully gone exactly at scroll 220vh
        // (tentang's vertical center — matches the dock-icon endpoint).
        const anchors: [number, number, number][] = [
          [ 130, 270, 0    ],   // 0: hidden below — flat, no wave
          [  60, 220, 0.45 ],   // 1: rising, wave gently forming
          [ -10, 160, 1    ],   // 2: full cover (bottom well past viewport)
          [ -50, 105, 1    ],   // 3: still fully covers seam during mid-exit
          [-120,  40, 0.5  ],   // 4: exiting, bottom still covers late seam
          [-200, -20, 0    ],   // 5: hidden above — flat, no wave
        ];
        return anchors.map(([tY, bY, mult]) => {
          const wt = (i: number) => tY + Math.sin(phase + i) * amp * mult;
          const wb = (i: number) => bY + Math.sin(phase + 1.2 + i) * amp * mult * 0.85;
          return (
            `M0,${wt(0)} ` +
            `C15,${wt(1)} 35,${wt(2)} 50,${wt(3)} ` +
            `C65,${wt(4)} 85,${wt(5)} 100,${wt(6)} ` +
            `L100,${wb(0)} ` +
            `C85,${wb(1)} 65,${wb(2)} 50,${wb(3)} ` +
            `C35,${wb(4)} 15,${wb(5)} 0,${wb(6)} Z`
          );
        });
      };

      // Two layers with different phase + amplitude → dynamic morphing parallax.
      // Back layer lags slightly behind (lower amp, phase offset) so as the
      // front crest peaks, the back crest is still rising — that offset is
      // what creates the "dynamic morphing" depth effect.
      const backStates  = buildStates(5,  0.6);   // gentler, slower rhythm
      const frontStates = buildStates(8,  2.9);   // sharper, leads the motion

      ctx = gsap.context(() => {
        if (waveBackRef.current)  gsap.set(waveBackRef.current,  { attr: { d: backStates[0]  } });
        if (waveFrontRef.current) gsap.set(waveFrontRef.current, { attr: { d: frontStates[0] } });

        // 1) Pin hero only while the wave is RISING + COVERING. Pin releases
        //    mid-wave (during the covered phase) so hero slides away and
        //    tentang slides in behind the curtain of the wave — the user
        //    never sees a "still on hero" moment when the wave clears.
        // Dock is fixed-positioned (out of flow), so hero's top sits at
        // viewport top from scroll 0 — no nav-height offset needed.
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'top top',
          end: `+=100%`,         // pin for 100vh — widens the blank/transition
                                 // band between hero and tentang so the wave has
                                 // more room to fully sweep across.
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        });

        // 2) Wave timeline runs across the FULL journey — through the pin
        //    and past it — so the wave keeps exiting as tentang scrolls in.
        //    Anchored to the document (not #hero) because sharing a trigger
        //    with the pin above makes ScrollTrigger resolve start/end against
        //    the pin-spacer, which delayed the wave until AFTER the pin ended.
        //    Using the document decouples the scroll mapping so the wave
        //    starts rising the moment the user scrolls on hero.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: `+=${window.innerHeight * 2.2}`,  // 220vh — wave fully exits at tentang's center
            scrub: 1,
          },
        });
        for (let i = 1; i < frontStates.length; i++) {
          const label = `s${i}`;
          tl.add(label, (i - 1) * 1);
          if (waveBackRef.current) {
            tl.to(waveBackRef.current, {
              attr: { d: backStates[i] },
              ease: 'none',
              duration: 1,
            }, label);
          }
          if (waveFrontRef.current) {
            tl.to(waveFrontRef.current, {
              attr: { d: frontStates[i] },
              ease: 'none',
              duration: 1,
            }, label);
          }
        }
      });

      cleanupFn = () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
        ctx?.revert();
      };

      // If unmount already happened while gsap was still loading, revert now.
      if (cancelled) cleanupFn();
    })();

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, []);


  const fetchData = async () => {
    try {
      const [evRes, stRes] = await Promise.all([
        api.get('/events?status=UPCOMING'),
        api.get('/events/stats'),
      ]);
      setEvents(evRes.data.slice(0, 6));
      setStats(stRes.data);
    } catch {} finally { setLoadingEvents(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <style>{`
        @keyframes _heroFade { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _heroLine { from { height:0; } to { height:48px; } }
        @keyframes _statCount { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes _shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .nav-link-hover { transition: all 0.2s ease !important; }
        .nav-link-hover:hover { background: rgba(14,165,233,0.06) !important; color: #0369a1 !important; }
        .event-card-premium { transition: all 0.35s cubic-bezier(0.4,0,0.2,1) !important; }
        .event-card-premium:hover { transform: translateY(-6px) !important; box-shadow: 0 20px 40px rgba(14,165,233,0.12) !important; border-color: rgba(14,165,233,0.2) !important; }
        .stat-card-premium { transition: all 0.3s ease !important; }
        .stat-card-premium:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(14,165,233,0.1) !important; }
        .btn-cta { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .btn-cta:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(14,165,233,0.3) !important; }
      `}</style>

      {/* Floating liquid-glass dock (replaces the top navbar) */}
      <Dock>
        {/* Brand — PILAR logo (returns to Beranda / top of page) */}
        <DockIcon label="PILAR" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/LOGO_PILAR.png" alt="PILAR" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        </DockIcon>

        <span style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.25)', margin: '0 4px' }}/>

        <DockIcon
          label="Tentang Kami"
          onClick={() => {
            // Scroll to the VERTICAL CENTER of tentang — matches the wave
            // timeline's end (scroll 220vh), so the wave is fully gone on
            // arrival and tentang fills the viewport cleanly.
            const el = document.getElementById('tentang');
            if (!el) return;
            const rectTop = el.getBoundingClientRect().top + window.scrollY;
            const target = rectTop + el.offsetHeight / 2 - window.innerHeight / 2;
            window.scrollTo({ top: target, behavior: 'smooth' });
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </DockIcon>

        <DockIcon
          label="Event Mendatang"
          onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </DockIcon>

        {mounted && user ? (
          <>
            <DockIcon
              label="Dashboard"
              onClick={() => router.push(user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1"/>
                <rect x="14" y="3" width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
                <rect x="3" y="16" width="7" height="5" rx="1"/>
              </svg>
            </DockIcon>

            {user.role !== 'ADMIN' && (
              <DockIcon label="Sertifikat" onClick={() => router.push('/sertifikat')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="9" r="5"/>
                  <path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5"/>
                </svg>
              </DockIcon>
            )}

            <DockIcon label="Profil" onClick={() => router.push('/profile')}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#0ea5e9,#0369a1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(14,165,233,0.25)',
              }}>
                {user.foto
                  ? <img src={user.foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                  : user.nama?.charAt(0).toUpperCase()}
              </div>
            </DockIcon>

            <DockIcon label="Pengaturan" onClick={() => router.push('/settings')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </DockIcon>

            <span style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.25)', margin: '0 4px' }}/>

            <DockIcon label="Keluar" onClick={() => { logout(); router.push('/'); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </DockIcon>
          </>
        ) : mounted && (
          <>
            <DockIcon label="Masuk" onClick={() => router.push('/login')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </DockIcon>

            <DockIcon label="Daftar" onClick={() => router.push('/register')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </DockIcon>
          </>
        )}
      </Dock>

      {/* Hero */}
      <section id="hero" style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        backgroundImage: 'url(/pilar-main-bg.JPEG)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        {/* Dark gradient overlay — keeps text readable on any photo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(3,21,45,0.55) 0%, rgba(3,21,45,0.35) 45%, rgba(3,21,45,0.65) 100%)',
          pointerEvents: 'none',
        }}/>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.18) 0%, transparent 70%)', animation: '_float 6s ease-in-out infinite', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', animation: '_float 8s ease-in-out infinite 1s', pointerEvents: 'none' }}/>

        <p style={{
          position: 'relative',
          fontSize: '11px', letterSpacing: '0.2em', color: '#bae6fd',
          textTransform: 'uppercase', marginBottom: '28px',
          animation: '_heroFade 0.6s ease 0.1s both',
          textShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}>Peduli Laut dan Pesisir</p>
        <h1 style={{
          position: 'relative',
          fontFamily: 'DM Serif Display, serif',
          fontSize: 'clamp(72px, 14vw, 140px)',
          color: '#ffffff', letterSpacing: '-0.03em',
          lineHeight: 1, marginBottom: '20px',
          animation: '_heroFade 0.8s ease 0.2s both',
          background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #7dd3fc 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.35))',
        }}>PILAR</h1>
        <p style={{
          position: 'relative',
          fontSize: '15px', color: '#e0f2fe', maxWidth: '420px', lineHeight: 1.7,
          animation: '_heroFade 0.8s ease 0.4s both',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          Platform relawan pembersihan pantai terbesar di Indonesia.
          Bergabung dan jadilah bagian dari perubahan.
        </p>
        <div style={{ position: 'relative', display: 'flex', gap: '12px', marginTop: '32px', animation: '_heroFade 0.8s ease 0.6s both' }}>
          <a href="#events" className="btn-cta" style={{
            fontSize: '14px', color: '#fff', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '12px',
            background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', fontWeight: '600',
            boxShadow: '0 4px 20px rgba(14,165,233,0.45)',
          }}>Jelajahi Event</a>
          <a href="#tentang" style={{
            fontSize: '14px', color: '#ffffff', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.12)', fontWeight: '500',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          >Tentang Kami</a>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', animation: '_heroFade 1s ease 0.8s both' }}>
          <div style={{ width: '1px', height: '0px', background: 'linear-gradient(to bottom,transparent,#e0f2fe)', animation: '_heroLine 1s ease 1.2s forwards' }}/>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e0f2fe" strokeWidth="2" style={{ animation: '_float 2s ease-in-out infinite' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </section>

      {/* Statistik Real */}
      <section id="tentang" style={{
        minHeight: '140vh',      // taller section — gives the wave room to finish
                                 // exiting and the content a larger canvas
        padding: '220px 48px 260px 48px',  // larger bottom padding lifts the
                                            // flex-end content a bit higher from
                                            // the section's bottom edge
        background: 'linear-gradient(180deg, #fdfaf5 0%, #f0f7ff 100%)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '56px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>Tentang Kami</p>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '40px', color: '#0c4a6e', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              Bersama Jaga Laut Indonesia
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto' }}>
              PILAR adalah platform yang menghubungkan relawan dan penyelenggara
              kegiatan bersih pantai di seluruh Indonesia. Bersama, kita jaga kebersihan
              laut untuk generasi mendatang.
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              { value: stats.totalEvent, label: 'Event Diselenggarakan', suffix: '', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { value: stats.totalRelawan, label: 'Total Relawan Aktif', suffix: '', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { value: stats.totalSampahKg, label: 'Kilogram Sampah Terkumpul', suffix: ' kg', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> },
            ].map((s, i) => (
              <div key={i} className="stat-card-premium" style={{
                background: '#fff', borderRadius: '20px',
                border: '1px solid rgba(14,165,233,0.08)', padding: '32px 28px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                animation: `_statCount 0.5s ease ${0.15 * i}s both`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>
                <div style={{ marginBottom: '14px', color: '#0ea5e9' }}>{s.icon}</div>
                <div style={{ fontSize: '44px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '8px' }}>
                  {s.value.toLocaleString('id-ID')}{s.suffix}
                </div>
                <div style={{ fontSize: '13px', color: '#7baac7', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Mendatang */}
      <section id="events" style={{ padding: '100px 48px', background: '#fff' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#0ea5e9', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>Event Mendatang</p>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '40px', color: '#0c4a6e', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Bergabung Sekarang
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
              Temukan event bersih pantai terdekat dan mulai berkontribusi untuk lingkungan
            </p>
          </div>

          {loadingEvents ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#b0c8d8', fontSize: '14px' }}>Memuat event...</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#b0c8d8', fontSize: '14px' }}>Belum ada event mendatang</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '24px' }}>
              {events.map((e: any, idx: number) => (
                <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="event-card-premium"
                    style={{
                      background: '#fff', borderRadius: '18px',
                      border: '1px solid rgba(14,165,233,0.06)', overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      animation: `_statCount 0.5s ease ${0.08 * idx}s both`,
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      {e.gambar
                        ? <img src={e.gambar} alt={e.judul} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                            onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}
                          />
                        : <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg,#e0f2fe 0%,#bae6fd 50%,#7dd3fc 100%)' }}/>
                      }
                      {/* Date badge overlay */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '6px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600' }}>
                          {e.tanggal ? format(new Date(e.tanggal), 'd MMM', { locale: id }) : '-'}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#0c4a6e', marginBottom: '6px', lineHeight: 1.3 }}>{e.judul}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#7baac7', marginBottom: '16px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {e.lokasi}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ display: 'flex' }}>
                            {[0,1,2].map(i => (
                              <div key={i} style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(135deg, ${['#bae6fd','#7dd3fc','#38bdf8'][i]}, #0ea5e9)`, border: '2px solid #fff', marginLeft: i > 0 ? '-6px' : 0 }}/>
                            ))}
                          </div>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {e._count?.pendaftaran || 0}/{e.kuota}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600', padding: '5px 14px', background: 'linear-gradient(135deg,#e0f2fe,#f0f9ff)', borderRadius: '8px' }}>
                          Detail →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 48px 36px', borderTop: '1px solid rgba(14,165,233,0.06)', background: 'linear-gradient(180deg, #fff 0%, #f0f7ff 100%)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Top row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '48px', marginBottom: '40px' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <img src="/LOGO_PILAR.png" alt="PILAR" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>PILAR</span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#7baac7', lineHeight: 1.7, maxWidth: '280px' }}>
                Platform relawan pembersihan pantai terbesar di Indonesia. Bersama menjaga laut untuk generasi mendatang.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Navigasi</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { href: '#tentang', label: 'Tentang Kami' },
                  { href: '#events', label: 'Cari Event' },
                  { href: '/login', label: 'Masuk', isLink: true },
                  { href: '/register', label: 'Daftar', isLink: true },
                ].map(item => item.isLink ? (
                  <Link key={item.href} href={item.href} style={{ fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                  >{item.label}</Link>
                ) : (
                  <a key={item.href} href={item.href} style={{ fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                  >{item.label}</a>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Hubungi Kami</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#25D366')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href="mailto:pilar.indonesia@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#0369a1')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7l-10 7L2 7"/></svg>
                  Email
                </a>
                <a href="https://instagram.com/pilar.indonesia" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7baac7', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E4405F')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#7baac7')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(14,165,233,0.06)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>© 2026 PILAR — Peduli Laut dan Pesisir</span>
            <span style={{ fontSize: '12.5px', color: '#b0c8d8', fontStyle: 'italic' }}>Menjaga laut untuk generasi mendatang</span>
          </div>
        </div>
      </footer>

      {/* GSAP MorphSVG layered ocean transition overlay (hero → about us) */}
      <div aria-hidden="true" style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 60,
        overflow: 'hidden',
      }}>
        <svg
          width="100%" height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ overflow: 'visible', display: 'block' }}
        >
          <defs>
            {/* Back layer — slightly deeper blue, sits behind the front crest */}
            <linearGradient id="_waveBackGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%"   stopColor="#0ea5e9"/>
              <stop offset="55%"  stopColor="#7dd3fc"/>
              <stop offset="100%" stopColor="#bae6fd"/>
            </linearGradient>
            {/* Front layer — soft blue fading into white at the crest */}
            <linearGradient id="_waveFrontGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%"   stopColor="#7dd3fc"/>
              <stop offset="55%"  stopColor="#e0f2fe"/>
              <stop offset="100%" stopColor="#ffffff"/>
            </linearGradient>
          </defs>

          {/* Back wave — renders first (behind), softer rhythm, muted */}
          <path
            ref={waveBackRef}
            fill="url(#_waveBackGrad)"
            opacity="0.85"
            d="M0,115 C15,115 35,115 50,115 C65,115 85,115 100,115 L100,260 C85,260 65,260 50,260 C35,260 15,260 0,260 Z"
          />
          {/* Front wave — renders on top, sharper crest fading into white */}
          <path
            ref={waveFrontRef}
            fill="url(#_waveFrontGrad)"
            d="M0,115 C15,115 35,115 50,115 C65,115 85,115 100,115 L100,260 C85,260 65,260 50,260 C35,260 15,260 0,260 Z"
          />
        </svg>
      </div>
    </div>
  );
}
