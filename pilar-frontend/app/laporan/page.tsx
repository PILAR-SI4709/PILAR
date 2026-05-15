{/* Data Sampah */}
{sampah.length > 0 && (
  <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f5f0e8', padding: '20px', marginBottom: '20px' }}>
    <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
      Rincian Sampah
    </h2>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sampah.map((s: any, i: number) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: '#fdfaf5',
            borderRadius: '10px'
          }}
        >
          <span style={{ fontSize: '13px', color: '#1a2332' }}>
            {s.jenis}
          </span>

          <span style={{ fontSize: '13px', fontWeight: '500', color: '#0369a1' }}>
            {s.jumlahKg} kg
          </span>
        </div>
      ))}
    </div>
  </div>
)}