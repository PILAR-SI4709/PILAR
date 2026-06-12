// TASK 3 & 4 - Konfigurasi form kesehatan (sumber kebenaran tunggal untuk label & aturan).
//
// 5 pernyataan kesehatan yang diisi relawan. `key` harus sama persis dengan
// key yang dikirim frontend pada field `kesehatan`.
export const KESEHATAN_OPTIONS: { key: string; label: string }[] = [
  { key: 'tidakAdaPenyakitJantung', label: 'Tidak memiliki penyakit jantung' },
  { key: 'tidakAdaAsma', label: 'Tidak memiliki asma atau gangguan pernapasan' },
  { key: 'bisaBerjalanJauh', label: 'Mampu berjalan jauh lebih dari 2 km' },
  { key: 'tidakAlergiLaut', label: 'Tidak alergi terhadap lingkungan laut' },
  { key: 'tidakHamilAtauMenyusui', label: 'Tidak dalam kondisi hamil atau menyusui' },
];

// Pilihan yang WAJIB dicentang. Bila salah satu tidak dicentang, pendaftaran
// otomatis DITOLAK (lihat TASK 4). Ubah daftar ini bila kriteria wajib berbeda.
export const KESEHATAN_WAJIB: string[] = ['bisaBerjalanJauh'];

export const labelKesehatan = (key: string) =>
  KESEHATAN_OPTIONS.find((o) => o.key === key)?.label || key;
