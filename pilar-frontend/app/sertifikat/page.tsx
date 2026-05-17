'use client';
import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function SertifikatPage() {
  const { user, loadFromStorage } = useAuthStore();
  const [pendaftaran, setPendaftaran] = useState<any[]>([]);
  const [sertifikat, setSertifikat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string|null>(null);
  const [downloading, setDownloading] = useState<string|null>(null);
  const [previewSert, setPreviewSert] = useState<any|null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFromStorage();
    fetchData();
  }, []);

  // PBI #34 - Marshall Rasendria - Auto Generate Sertifikat
  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/pendaftaran/my'),
        api.get('/sertifikat/my'),
      ]);
      setPendaftaran(pRes.data.filter((p: any) => p.status === 'APPROVED'));
      setSertifikat(sRes.data);
    } catch {} finally { setLoading(false); }
  };

  const getSertForPendaftaran = (pendaftaranId: string) =>
    sertifikat.find(s => s.pendaftaranId === pendaftaranId);

  const handleGenerate = async (pendaftaranId: string) => {
    setGenerating(pendaftaranId);
    try {
      await api.post(`/sertifikat/generate/${pendaftaranId}`);
      toast.success('Sertifikat berhasil dibuat!');
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat sertifikat');
    } finally { setGenerating(null); }
  };

  const handleDownload = async (sert: any) => {
    setDownloading(sert.id);
    setPreviewSert(sert);
    setTimeout(async () => {
      try {
        const { default: html2canvas } = await import('html2canvas');
        const { jsPDF } = await import('jspdf');
        const el = certRef.current;
        if (!el) return;
        const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const w = pdf.internal.pageSize.getWidth();
        const h = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, w, h);
        pdf.save(`Sertifikat-PILAR-${sert.nomorSertifikat}.pdf`);
        toast.success('Sertifikat berhasil diunduh!');
      } catch {
        toast.error('Gagal mengunduh sertifikat');
      } finally {
        setDownloading(null);
        setPreviewSert(null);
      }
    }, 800);
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ color: '#b0c8d8', fontSize: '14px' }}>Memuat...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <style>{`
        @keyframes _sertFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes _glow { 0%,100% { box-shadow: 0 0 12px rgba(14,165,233,0.1); } 50% { box-shadow: 0 0 24px rgba(14,165,233,0.2); } }
        .sert-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
        .sert-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(14,165,233,0.1) !important; }
        .sert-btn { transition: all 0.25s ease !important; }
        .sert-btn:hover { transform: translateY(-1px) !important; }
        .sert-btn-primary:hover { box-shadow: 0 6px 20px rgba(14,165,233,0.3) !important; }
        .sert-btn-outline:hover { background: linear-gradient(135deg, #e0f2fe, #f0f9ff) !important; border-color: #0ea5e9 !important; }
        .sert-btn-dark:hover { box-shadow: 0 6px 20px rgba(12,74,110,0.3) !important; }
        .sert-preview-wrap { transition: all 0.4s cubic-bezier(0.4,0,0.2,1) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px', animation: '_sertFade 0.5s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.8">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '600' }}>Penghargaan</p>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e', letterSpacing: '-0.02em' }}>Sertifikat Saya</h1>
          </div>
        </div>
        <p style={{ fontSize: '13.5px', color: '#7baac7', marginTop: '8px', lineHeight: 1.6, marginLeft: '52px' }}>
          Sertifikat tersedia setelah event selesai dan pendaftaran disetujui
        </p>
      </div>

      {pendaftaran.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(14,165,233,0.06)', padding: '64px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: '_sertFade 0.5s ease 0.1s both' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', animation: '_glow 3s ease-in-out infinite' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="1.5">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          </div>
          <p style={{ color: '#0c4a6e', fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>Belum ada sertifikat</p>
          <p style={{ color: '#7baac7', fontSize: '13px', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>Ikuti event dan selesaikan kegiatan untuk mendapatkan sertifikat</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendaftaran.map((p: any, idx: number) => {
            const sert = getSertForPendaftaran(p.id);
            const eventDone = p.event?.status === 'DONE';
            const isDownloading = downloading === sert?.id;

            return (
              <div key={p.id} className="sert-card" style={{
                background: '#fff', borderRadius: '18px',
                border: sert ? '1px solid rgba(14,165,233,0.1)' : '1px solid rgba(14,165,233,0.06)',
                padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px',
                boxShadow: sert ? '0 4px 20px rgba(14,165,233,0.06)' : '0 2px 12px rgba(0,0,0,0.02)',
                animation: `_sertFade 0.4s ease ${0.08 * idx}s both`,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Gradient accent for certificates that exist */}
                {sert && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc)' }}/>}

                {/* Icon sertifikat */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: sert ? 'linear-gradient(135deg, #0ea5e9, #0369a1)' : 'linear-gradient(135deg, #f8fbff, #f0f9ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: sert ? '0 4px 14px rgba(14,165,233,0.25)' : 'none',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke={sert ? "#fff" : "#b0c8d8"} strokeWidth="1.8">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                </div>

                {/* Info event */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.event?.judul}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#7baac7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    {p.event?.tanggal ? format(new Date(p.event.tanggal), 'd MMMM yyyy', { locale: id }) : '-'}
                    {p.event?.lokasi && (
                      <>
                        <span style={{ color: '#d4e2ed' }}>·</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {p.event.lokasi}
                      </>
                    )}
                  </div>
                  {sert && (
                    <div style={{ fontSize: '11px', color: '#b0c8d8', marginTop: '4px', fontFamily: 'var(--font-mono, monospace)', background: 'rgba(14,165,233,0.04)', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>
                      {sert.nomorSertifikat}
                    </div>
                  )}
                </div>

                {/* Status dan tombol */}
                <div style={{ flexShrink: 0 }}>
                  {!eventDone ? (
                    <span style={{ fontSize: '12px', color: '#94a3b8', padding: '6px 14px', background: 'linear-gradient(135deg, #f1f5f9, #f8fafc)', borderRadius: '10px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Event belum selesai
                    </span>
                  ) : sert ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setPreviewSert(previewSert?.id === sert.id ? null : sert)}
                        className="sert-btn sert-btn-outline"
                        style={{ padding: '8px 16px', borderRadius: '10px', border: '1.5px solid rgba(14,165,233,0.15)', background: '#fff', color: '#0369a1', cursor: 'pointer', fontSize: '12.5px', fontWeight: '600' }}>
                        Pratinjau
                      </button>
                      <button
                        onClick={() => handleDownload(sert)}
                        disabled={isDownloading}
                        className="sert-btn sert-btn-primary"
                        style={{ padding: '8px 18px', borderRadius: '10px', background: isDownloading ? '#7baac7' : 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#fff', border: 'none', cursor: isDownloading ? 'wait' : 'pointer', fontSize: '12.5px', fontWeight: '600', boxShadow: '0 3px 12px rgba(14,165,233,0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {isDownloading ? 'Mengunduh...' : 'Unduh PDF'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerate(p.id)}
                      disabled={generating === p.id}
                      className="sert-btn sert-btn-dark"
                      style={{ padding: '8px 18px', borderRadius: '10px', background: generating === p.id ? '#f0f9ff' : 'linear-gradient(135deg, #0c4a6e, #0369a1)', color: generating === p.id ? '#7baac7' : '#fff', border: 'none', cursor: generating === p.id ? 'wait' : 'pointer', fontSize: '12.5px', fontWeight: '600', boxShadow: '0 3px 12px rgba(12,74,110,0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                      {generating === p.id ? 'Membuat...' : 'Ambil Sertifikat'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview sertifikat inline */}
      {previewSert && !downloading && (
        <div className="sert-preview-wrap" style={{ marginTop: '28px', background: '#fff', borderRadius: '22px', border: '1px solid rgba(14,165,233,0.08)', padding: '28px', boxShadow: '0 8px 32px rgba(14,165,233,0.06)', animation: '_sertFade 0.4s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pratinjau Sertifikat</h2>
            <button onClick={() => setPreviewSert(null)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}
            >×</button>
          </div>
          <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <CertificateTemplate sert={previewSert} certRef={null} user={user}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={() => handleDownload(previewSert)} className="sert-btn sert-btn-primary" style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13.5px', fontWeight: '600', boxShadow: '0 4px 16px rgba(14,165,233,0.25)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Unduh PDF
            </button>
          </div>
        </div>
      )}

      {/* Template hidden untuk render PDF */}
      {downloading && (
        <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}>
          <CertificateTemplate sert={previewSert} certRef={certRef} user={user}/>
        </div>
      )}
    </DashboardLayout>
  );
}

// Template Sertifikat untuk Render PDF
function CertificateTemplate({ sert, certRef, user }: { sert: any, certRef: any, user: any }) {
  if (!sert) return null;

  const tanggalEvent = sert.event?.tanggal
    ? format(new Date(sert.event.tanggal), 'd MMMM yyyy', { locale: id })
    : '-';
  const tanggalIssued = sert.issuedAt
    ? format(new Date(sert.issuedAt), 'd MMMM yyyy', { locale: id })
    : '-';

  return (
    <div ref={certRef} style={{
      width: '900px', height: '636px',
      background: '#ffffff',
      display: 'flex',
      fontFamily: 'Georgia, "Times New Roman", serif',
      overflow: 'hidden',
    }}>
      {/* Panel kiri biru */}
      <div style={{
        width: '200px', flexShrink: 0,
        background: 'linear-gradient(180deg,#0c4a6e 0%,#0369a1 60%,#0ea5e9 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px', gap: '24px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontFamily: 'Georgia, serif', color: '#fff', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '4px' }}>PILAR</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>Peduli Laut dan Pesisir</div>
        </div>
        <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.4)' }}/>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
            <circle cx="12" cy="8" r="6"/>
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        </div>
        <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.4)' }}/>
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', fontFamily: 'monospace', writingMode: 'vertical-rl', textTransform: 'uppercase' }}>
          {sert.nomorSertifikat}
        </div>
      </div>

      {/* Panel kanan konten */}
      <div style={{ flex: 1, padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', width: '60px', height: '60px', borderTop: '2px solid #bae6fd', borderRight: '2px solid #bae6fd' }}/>
        <div style={{ position: 'absolute', bottom: '16px', left: '220px', width: '60px', height: '60px', borderBottom: '2px solid #bae6fd', borderLeft: '2px solid #bae6fd' }}/>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#7baac7', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', marginBottom: '10px' }}>Sertifikat Keikutsertaan</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'Arial, sans-serif', marginBottom: '22px' }}>Diberikan dengan bangga kepada</div>
          <div style={{ fontSize: '38px', fontFamily: 'Georgia, serif', color: '#0c4a6e', fontStyle: 'italic', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '6px' }}>
            {sert.user?.nama || user?.nama}
          </div>
          <div style={{ width: '120px', height: '2px', background: 'linear-gradient(to right,#0ea5e9,#bae6fd)', marginBottom: '22px' }}/>
          <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Arial, sans-serif', lineHeight: 1.7 }}>
            telah berhasil menyelesaikan dan berpartisipasi dalam kegiatan<br/>
            <span style={{ fontWeight: 'bold', color: '#0c4a6e', fontSize: '13px' }}>{sert.event?.judul}</span><br/>
            yang diselenggarakan pada <strong>{tanggalEvent}</strong> di {sert.event?.lokasi}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#b0c8d8', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>Diterbitkan</div>
            <div style={{ fontSize: '11px', color: '#4a6580', fontFamily: 'Arial, sans-serif' }}>{tanggalIssued}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '100px', height: '1px', background: '#e2e8f0', marginBottom: '6px' }}/>
            <div style={{ fontSize: '9px', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>Koordinator PILAR</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', color: '#b0c8d8', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>Verifikasi</div>
            <div style={{ fontSize: '9px', color: '#7baac7', fontFamily: 'monospace' }}>pilar.id/verify</div>
          </div>
        </div>
      </div>
    </div>
  );
}
