'use client';
import { useRef, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  value: string;
  onChange: (url: string) => void;
  endpoint?: string;
  fieldName?: string;
}

export default function ImageUpload({
  value,
  onChange,
  endpoint = '/events/upload-gambar',
  fieldName = 'gambar',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (max 5MB) dan tipe
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    // Preview lokal dulu
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
      setPreview(res.data.url);
      toast.success('Gambar berhasil diunggah');
    } catch {
      toast.error('Gagal mengunggah gambar');
      setPreview(value || '');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div>
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '8px' }}>
        Gambar Event <span style={{ color: '#b0c8d8', fontWeight: '400' }}>(opsional)</span>
      </label>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          border: `2px dashed ${preview ? '#bae6fd' : '#e8dcc8'}`,
          borderRadius: '12px',
          padding: preview ? '0' : '32px 16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: preview ? 'transparent' : '#fdfaf5',
          transition: 'all 0.2s',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
            />
            {/* Overlay ganti */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(12,74,110,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
            >
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                {uploading ? 'Mengunggah...' : 'Klik untuk ganti gambar'}
              </span>
            </div>
          </>
        ) : (
          <div>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0c8d8" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block' }}>
              <rect x="3" y="3" width="18" height="18" rx="4"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            <p style={{ fontSize: '13px', color: '#7baac7', marginBottom: '4px' }}>
              {uploading ? 'Mengunggah...' : 'Klik atau seret gambar ke sini'}
            </p>
            <p style={{ fontSize: '11px', color: '#b0c8d8' }}>PNG, JPG, WEBP — maks. 5MB</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {/* Tombol hapus */}
      {preview && !uploading && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setPreview(''); onChange(''); }}
          style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Hapus gambar
        </button>
      )}
    </div>
  );
}