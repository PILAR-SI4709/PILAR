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

        {/* Galeri Dokumentasi */}
        {dokumentasi.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #f5f0e8', padding: '20px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Galeri Dokumentasi</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
              {dokumentasi.map((d: any) => (
                <div key={d.id} style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={d.fotoUrl} alt={d.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}