{/* PBI #30 - Syifa Rizani - Fitur Pencarian dan Filter Event Berdasarkan Nama/Lokasi/Status */}
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