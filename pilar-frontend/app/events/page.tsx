'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const kesehatanOptions = [
  { key: 'tidakAdaPenyakitJantung', label: 'Tidak memiliki penyakit jantung' },
  { key: 'tidakAdaAsma',           label: 'Tidak memiliki asma atau gangguan pernapasan' },
  { key: 'bisaBerjalanJauh',        label: 'Mampu berjalan jauh lebih dari 2 km' },
  { key: 'tidakAlergiLaut',         label: 'Tidak alergi terhadap lingkungan laut' },
  { key: 'tidakHamilAtauMenyusui',   label: 'Tidak dalam kondisi hamil atau menyusui' },
];

export default function FormPendaftaranPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const { user, loadFromStorage } = useAuthStore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    nik: '', alamat: '', tanggalLahir: '', noHp: '',
    motivasi: '', izin: false,
    kesehatan: {} as Record<string, boolean>,
  });

  useEffect(() => {
    loadFromStorage();
    fetchEvent();
  }, []);

  useEffect(() => {
    if (!user && event !== null) {
      window.location.href = `/login?redirect=/events/${eventId}/daftar`;
    }
  }, [user, event]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
    } catch { router.push('/'); }
  };

  const setField = (key: string, val: any) =>
    setForm(p => ({ ...p, [key]: val }));

  const toggleKesehatan = (key: string) =>
    setForm(p => ({ ...p, kesehatan: { ...p.kesehatan, [key]: !p.kesehatan[key] } }));

  const handleSubmit = async () => {
    if (!form.izin) { toast.error('Harap centang pernyataan izin'); return; }
    setLoading(true);
    try {
      await api.post('/pendaftaran', {
        eventId,
        motivasi: form.motivasi,
        kesehatan: form.kesehatan,
        izin: form.izin,
        nik: form.nik,
        alamat: form.alamat,
        tanggalLahir: form.tanggalLahir,
        noHp: form.noHp,
      });
      toast.success('Pendaftaran berhasil! Menunggu persetujuan admin.');
      setTimeout(() => router.push(`/events/${eventId}`), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Pendaftaran gagal');
    } finally { setLoading(false); }
  };

  const steps = [
    { n: 1, label: 'Informasi Umum' },
    { n: 2, label: 'Identitas' },
    { n: 3, label: 'Motivasi' },
    { n: 4, label: 'Kesehatan' },
    { n: 5, label: 'Izin' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fdfaf5' }}>

      {/* Navbar */}
      <nav style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', background: '#fff', borderBottom: '1px solid #f5f0e8' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 18c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M3 12c0 0 4-4 9-4s9 4 9 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/></svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#0c4a6e' }}>PILAR</span>
        </Link>
        <span style={{ fontSize: '13px', color: '#7baac7' }}>
          Form Pendaftaran {event ? `— ${event.judul}` : ''}
        </span>
        <Link href={`/events/${eventId}`} style={{ fontSize: '13px', color: '#7baac7', textDecoration: 'none' }}>Batal</Link>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px', gap: '0' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '600',
                background: s.n <= step ? '#0ea5e9' : '#f0f9ff',
                color: s.n <= step ? '#fff' : '#b0c8d8',
              }}>{s.n === step ? s.n : s.n < step ? '✓' : s.n}</div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: s.n < step ? '#0ea5e9' : '#f0f9ff', margin: '0 4px' }}/>
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f5f0e8', padding: '32px' }}>

          {/* Step 1 — Informasi Umum */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>Informasi Umum</h2>
              <p style={{ fontSize: '13px', color: '#7baac7', marginBottom: '24px' }}>Data ini otomatis diisi dari akun kamu</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Nama Lengkap', value: user?.nama || '', disabled: true },
                  { label: 'Email', value: user?.email || '', disabled: true },
                ].map(f => (
                  <div key={f.label}>
                    <label className="label">{f.label}</label>
                    <input className="input" value={f.value} disabled={f.disabled}
                      style={{ background: '#fdfaf5', color: '#94a3b8' }}/>
                  </div>
                ))}
                <div>
                  <label className="label">Nomor HP</label>
                  <input className="input" type="tel" placeholder="08xxxxxxxxxx"
                    value={form.noHp} onChange={e => setField('noHp', e.target.value)}/>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Identitas */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>Identitas Diri</h2>
              <p style={{ fontSize: '13px', color: '#7baac7', marginBottom: '24px' }}>Diperlukan untuk verifikasi peserta</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">NIK (Nomor Induk Kependudukan)</label>
                  <input className="input" placeholder="16 digit NIK" maxLength={16}
                    value={form.nik} onChange={e => setField('nik', e.target.value)}/>
                </div>
                <div>
                  <label className="label">Tanggal Lahir</label>
                  <input className="input" type="date"
                    value={form.tanggalLahir} onChange={e => setField('tanggalLahir', e.target.value)}/>
                </div>
                <div>
                  <label className="label">Alamat Lengkap</label>
                  <textarea className="input" rows={3} placeholder="Jl. ..."
                    value={form.alamat} onChange={e => setField('alamat', e.target.value)}
                    style={{ resize: 'none' }}/>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Motivasi */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>Motivasi</h2>
              <p style={{ fontSize: '13px', color: '#7baac7', marginBottom: '24px' }}>Ceritakan alasan kamu ingin bergabung</p>
              <label className="label">Mengapa kamu ingin menjadi relawan di event ini?</label>
              <textarea className="input" rows={6}
                placeholder="Tuliskan motivasimu di sini..."
                value={form.motivasi} onChange={e => setField('motivasi', e.target.value)}
                style={{ resize: 'none' }}/>
              <p style={{ fontSize: '12px', color: '#b0c8d8', marginTop: '6px' }}>
                {form.motivasi.length}/500 karakter
              </p>
            </div>
          )}

          {/* Step 4 — Kesehatan */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>Kondisi Kesehatan</h2>
              <p style={{ fontSize: '13px', color: '#7baac7', marginBottom: '24px' }}>Centang kondisi yang sesuai dengan keadaanmu</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {kesehatanOptions.map(opt => (
                  <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '10px', border: '1px solid', borderColor: form.kesehatan[opt.key] ? '#bae6fd' : '#f5f0e8', background: form.kesehatan[opt.key] ? '#f0f9ff' : '#fff', transition: 'all 0.15s' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                      border: form.kesehatan[opt.key] ? 'none' : '1.5px solid #d4bc98',
                      background: form.kesehatan[opt.key] ? '#0ea5e9' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} onClick={() => toggleKesehatan(opt.key)}>
                      {form.kesehatan[opt.key] && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                    </div>
                    <span style={{ fontSize: '13.5px', color: '#1a2332' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 — Izin */}
          {step === 5 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>Pernyataan Izin</h2>
              <p style={{ fontSize: '13px', color: '#7baac7', marginBottom: '24px' }}>Baca dan setujui pernyataan berikut</p>
              <div style={{ background: '#fdfaf5', borderRadius: '12px', padding: '20px', marginBottom: '20px', fontSize: '13px', color: '#4a6580', lineHeight: 1.7 }}>
                Saya menyatakan bahwa data yang saya isi adalah benar dan saya bersedia mengikuti seluruh rangkaian kegiatan dengan penuh tanggung jawab. Saya juga menyatakan bahwa saya telah mendapat izin dari orang tua/wali/atasan untuk berpartisipasi dalam kegiatan ini.
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '1px',
                  border: form.izin ? 'none' : '1.5px solid #d4bc98',
                  background: form.izin ? '#0ea5e9' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setField('izin', !form.izin)}>
                  {form.izin && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                </div>
                <span style={{ fontSize: '13.5px', color: '#1a2332', lineHeight: 1.6 }}>
                  Saya menyetujui pernyataan di atas dan bersedia mengikuti kegiatan
                </span>
              </label>
            </div>
          )}

          {/* Navigasi step */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', gap: '12px' }}>
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary">Kembali</button>
            ) : <div/>}

            {step < 5 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary">Lanjut</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                {loading ? 'Mengirim...' : 'Kirim Pendaftaran'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}