# README-TestPlan — PILAR

Dokumen ini adalah referensi lengkap untuk penulisan test case Playwright pada Sprint 1.
Dibuat berdasarkan hasil eksplorasi seluruh kode sumber backend (NestJS) dan frontend (Next.js).

---

## DAFTAR ISI

1. [Arsitektur Aplikasi](#1-arsitektur-aplikasi)
2. [Daftar Semua Endpoint Backend](#2-daftar-semua-endpoint-backend)
3. [Daftar Semua Halaman Frontend](#3-daftar-semua-halaman-frontend)
4. [Alur Bisnis Per Fitur](#4-alur-bisnis-per-fitur)
5. [Selector UI Penting (Playwright)](#5-selector-ui-penting-playwright)
6. [Data & Kondisi yang Dibutuhkan untuk Testing](#6-data--kondisi-yang-dibutuhkan-untuk-testing)

---

## 1. ARSITEKTUR APLIKASI

### Gambaran Umum

```
Browser (Next.js — localhost:3000)
    │
    │  HTTP/HTTPS (axios, base: /api via proxy atau direct)
    ▼
NestJS API (localhost:3001)
    │
    │  Prisma ORM
    ▼
PostgreSQL (Supabase)
```

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, Zustand (state), Axios
- **Backend**: NestJS 11, TypeScript, Prisma 5, JWT, Passport, bcryptjs
- **Database**: PostgreSQL (hosted di Supabase), connection pooling

### Sistem Autentikasi

#### Cara JWT Bekerja

```
POST /auth/login  →  Backend sign JWT(sub=userId, email, role)  →  Token berlaku 7 hari
```

Token di-sign dengan `process.env.JWT_SECRET` (fallback: `'fallback-secret'`).
Setiap request ke endpoint protected harus menyertakan header:

```
Authorization: Bearer <access_token>
```

#### Cara Frontend Menyimpan Token

File: `pilar-frontend/lib/store.ts`

| Storage | Key | Value |
|---------|-----|-------|
| localStorage | `pilar_token` | JWT string |
| localStorage | `pilar_user` | JSON.stringify(user object) |
| Cookie | `pilar_token` | JWT string (max-age 7 hari, SameSite=Lax) |

#### Cara Inject Token untuk Playwright Test

```typescript
// 1. Navigasi ke halaman mana saja dulu (agar origin tersedia)
await page.goto('http://localhost:3000');

// 2. Inject ke localStorage + cookie
await page.evaluate(({ token, user }) => {
  localStorage.setItem('pilar_token', token);
  localStorage.setItem('pilar_user', JSON.stringify(user));
  document.cookie = `pilar_token=${token}; path=/; max-age=604800; SameSite=Lax`;
}, { token, user });

// 3. Baru navigasi ke halaman target
await page.goto('/dashboard/admin');
```

#### Auto Attach Token (API Interceptor)

File: `pilar-frontend/lib/api.ts`

```typescript
// Setiap request: auto-attach Bearer token dari localStorage
// Setiap 401 response: clear localStorage + redirect ke /login
```

#### loadFromStorage (Zustand)

Tidak menggunakan `persist` middleware. Harus dipanggil manual di `useEffect`:
```typescript
useEffect(() => { loadFromStorage(); }, []);
```
`Sidebar.tsx` memanggil ini, sehingga semua halaman yang pakai `DashboardLayout` otomatis load token dari storage.

#### Login via Google OAuth

```
GET /auth/google  →  Google consent  →  GET /auth/google/callback
  →  Redirect ke /oauth-callback?token=...&user=encodeURIComponent(JSON)
  →  Frontend: extract params, setAuth(), redirect /
```

### Peran (Role) dan Perbedaan Akses

| Fitur / Endpoint | USER (Relawan) | ADMIN |
|---|---|---|
| Register / Login | ✅ | ✅ |
| Lihat daftar event | ✅ | ✅ |
| Daftar ke event | ✅ | ❌ |
| Lihat dashboard sendiri | ✅ (`/dashboard`) | ✅ (`/dashboard/admin`) |
| Lihat riwayat pendaftaran | ✅ | ❌ |
| Buat/Edit/Hapus event | ❌ | ✅ |
| Lihat daftar peserta event | ❌ | ✅ |
| Terima/Tolak peserta | ❌ | ✅ |
| Input laporan & sampah | ❌ | ✅ |
| Upload gambar event | ❌ | ✅ |
| Lihat laporan kegiatan | Auth required | ✅ |
| Update profil sendiri | ✅ | ✅ |
| Ganti password | ✅ | ✅ |

Role default saat register: `USER`. Role tidak bisa diubah melalui UI.

---

## 2. DAFTAR SEMUA ENDPOINT BACKEND

Base URL: `http://localhost:3001/api`

### Auth

| # | Method | Endpoint | Guard | Role | Request Body | Response |
|---|--------|----------|-------|------|-------------|----------|
| 1 | POST | `/auth/register` | Public | — | `{ nama, email, password(min6) }` | `{ message, user }` |
| 2 | POST | `/auth/login` | Public | — | `{ email, password }` | `{ access_token, user }` |
| 3 | GET | `/auth/me` | JwtAuth | Any | — | `{ id, nama, email, role, foto, bio, noHp, ... }` |
| 4 | GET | `/auth/google` | GoogleOAuth | — | — | Redirect ke Google |
| 5 | GET | `/auth/google/callback` | GoogleOAuth | — | — | Redirect ke `/oauth-callback?token=...&user=...` |

**Error Cases:**
- Register: `409 ConflictException` — "Email sudah terdaftar"
- Login: `401 UnauthorizedException` — "Email atau password salah"
- GET /me: `401 UnauthorizedException` — "User tidak ditemukan"

---

### Events

| # | Method | Endpoint | Guard | Role | Request Body / Query | Response |
|---|--------|----------|-------|------|---------------------|----------|
| 1 | GET | `/events` | Public | — | `?status=UPCOMING\|ONGOING\|DONE` | `[{ id, judul, deskripsi, lokasi, tanggal, kuota, gambar, status, adminId, admin, _count }]` |
| 2 | GET | `/events/stats` | Public | — | — | `{ totalEvent, totalRelawan, totalSampahKg }` |
| 3 | GET | `/events/:id` | Public | — | — | Same shape (single event) |
| 4 | POST | `/events` | JwtAuth + Roles | ADMIN | `{ judul, deskripsi, lokasi, tanggal(ISO), kuota(min1), gambar? }` | Created event |
| 5 | PATCH | `/events/:id` | JwtAuth + Roles | ADMIN | Semua field partial (+ `status?`) | Updated event |
| 6 | DELETE | `/events/:id` | JwtAuth + Roles | ADMIN | — | `{ message: "Event berhasil dihapus" }` |
| 7 | POST | `/events/upload-gambar` | JwtAuth + Roles | ADMIN | `multipart: gambar (max 5MB, image/*)` | `{ url }` |

**Error Cases:**
- GET/PATCH/DELETE `:id`: `404 NotFoundException` — "Event tidak ditemukan"
- PATCH/DELETE: `403 ForbiddenException` — "Tidak punya akses" (jika adminId != user.id)
- Upload: `400` — "File harus berupa gambar"

---

### Pendaftaran

| # | Method | Endpoint | Guard | Role | Request Body | Response |
|---|--------|----------|-------|------|-------------|----------|
| 1 | POST | `/pendaftaran` | JwtAuth | USER | `{ eventId, motivasi, kesehatan(obj), izin(bool), nik, alamat, tanggalLahir(ISO), noHp }` | Created pendaftaran + event info |
| 2 | GET | `/pendaftaran/my` | JwtAuth | Any | — | `[{ ...pendaftaran, event: { id, judul, tanggal, lokasi, gambar, status } }]` |
| 3 | GET | `/pendaftaran/cek/:eventId` | JwtAuth | Any | — | `{ terdaftar: bool, status: null\|PENDING\|APPROVED\|REJECTED }` |
| 4 | GET | `/pendaftaran/event/:eventId` | JwtAuth + Roles | ADMIN | — | `[{ ...pendaftaran, user: { id, nama, email, foto, noHp } }]` |
| 5 | GET | `/pendaftaran/:id` | JwtAuth | Any | — | `{ ...pendaftaran, user, event }` |
| 6 | PATCH | `/pendaftaran/:id/status` | JwtAuth + Roles | ADMIN | `{ status: PENDING\|APPROVED\|REJECTED }` | Updated pendaftaran + user + event |

**Error Cases:**
- POST: `404` — "Event tidak ditemukan"
- POST: `400` — "Event sudah selesai"
- POST: `400` — "Kuota event sudah penuh"
- POST: `400` — "Kamu sudah mendaftar di event ini"
- GET `:id`: `404` — "Pendaftaran tidak ditemukan"
- PATCH `:id/status`: `404` — "Pendaftaran tidak ditemukan"

---

### Users

| # | Method | Endpoint | Guard | Role | Request Body | Response |
|---|--------|----------|-------|------|-------------|----------|
| 1 | GET | `/users/profile` | JwtAuth | Any | — | `{ ...user, _count: { pendaftaran, sertifikat } }` |
| 2 | PATCH | `/users/profile` | JwtAuth | Any | `{ nama?, bio?, noHp?, foto? }` | Updated user |
| 3 | GET | `/users/stats` | JwtAuth | Any | — | `{ totalEvent, totalSampahKg }` |
| 4 | PATCH | `/users/password` | JwtAuth | Any | `{ passwordLama, passwordBaru(min6) }` | `{ message: "Password berhasil diubah" }` |
| 5 | POST | `/users/upload-foto` | JwtAuth | Any | `multipart: foto (max 2MB, image/*)` | `{ url, user }` |

**Error Cases:**
- GET profile: `404` — "User tidak ditemukan"
- PATCH password: `404` — "User tidak ditemukan"
- PATCH password: `400` — "Password lama salah"

---

### Sampah

| # | Method | Endpoint | Guard | Role | Request Body | Response |
|---|--------|----------|-------|------|-------------|----------|
| 1 | POST | `/sampah` | JwtAuth + Roles | ADMIN | `{ eventId, jenis, jumlahKg(min0.1), catatan? }` | Created sampah |
| 2 | GET | `/sampah/event/:eventId` | Public | — | — | `{ items: [...], totalKg: number }` |
| 3 | DELETE | `/sampah/:id` | JwtAuth + Roles | ADMIN | — | `{ message: "Data sampah dihapus" }` |

**Error Cases:**
- POST: `404` — "Event tidak ditemukan"
- DELETE: `404` — "Data sampah tidak ditemukan"

---

### Laporan

| # | Method | Endpoint | Guard | Role | Request Body | Response |
|---|--------|----------|-------|------|-------------|----------|
| 1 | GET | `/laporan` | JwtAuth | Any | — | `[{ ...event, _count: { pendaftaran, dokumentasi, sampah } }]` |
| 2 | GET | `/laporan/:eventId` | JwtAuth | Any | — | `{ event, ringkasan, peserta, dokumentasi, sampah }` |

**Error Cases:**
- GET `:eventId`: `404` — "Event tidak ditemukan"

---

### Prisma Schema — Struktur Database

```
User
  id           String   @id @default(uuid())
  nama         String
  email        String   @unique
  password     String   (bcrypt hashed)
  role         Role     @default(USER)   // USER | ADMIN
  foto         String?
  bio          String?
  noHp         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

Event
  id           String   @id @default(uuid())
  judul        String
  deskripsi    String
  lokasi       String
  tanggal      DateTime
  kuota        Int
  gambar       String?
  status       EventStatus @default(UPCOMING)  // UPCOMING | ONGOING | DONE
  adminId      String      (FK User)
  createdAt    DateTime
  updatedAt    DateTime

Pendaftaran
  id           String   @id @default(uuid())
  userId       String   (FK User)
  eventId      String   (FK Event)
  status       PendaftaranStatus @default(PENDING)  // PENDING | APPROVED | REJECTED
  motivasi     String
  kesehatan    Json     (object dengan 5 boolean flag)
  izin         Boolean  @default(false)
  nik          String
  alamat       String
  tanggalLahir DateTime
  noHp         String
  createdAt    DateTime
  updatedAt    DateTime
  @@unique([userId, eventId])  // satu user hanya bisa daftar 1x per event

Sampah
  id           String   @id @default(uuid())
  eventId      String   (FK Event)
  jenis        String
  jumlahKg     Float
  catatan      String?
  createdAt    DateTime

Dokumentasi
  id           String   @id @default(uuid())
  eventId      String   (FK Event)
  userId       String   (FK User)
  fotoUrl      String
  caption      String?
  createdAt    DateTime

Sertifikat
  id               String   @id @default(uuid())
  userId           String   (FK User)
  eventId          String   (FK Event)
  pendaftaranId    String   @unique (FK Pendaftaran)
  nomorSertifikat  String   @unique
  issuedAt         DateTime @default(now())
```

---

## 3. DAFTAR SEMUA HALAMAN FRONTEND

Base URL: `http://localhost:3000`

### Halaman Publik

| URL | File | Auth Required | Role | Deskripsi |
|-----|------|--------------|------|-----------|
| `/` | `app/page.tsx` | Tidak | — | Homepage: hero, stats, 6 event mendatang |
| `/login` | `app/login/page.tsx` | Tidak | — | Form login email/password + Google OAuth |
| `/register` | `app/register/page.tsx` | Tidak | — | Form registrasi akun baru |
| `/oauth-callback` | `app/oauth-callback/page.tsx` | Tidak | — | Proses token dari Google OAuth callback |
| `/events/:id` | `app/events/[id]/page.tsx` | Tidak (UI beda jika login) | — | Detail event + kartu pendaftaran |

### Halaman Terautentikasi — Relawan (USER)

| URL | File | Auth Required | Role | Deskripsi |
|-----|------|--------------|------|-----------|
| `/events/:id/daftar` | `app/events/[id]/daftar/page.tsx` | Ya | USER | Form pendaftaran relawan 5 langkah |
| `/dashboard` | `app/dashboard/page.tsx` | Ya | USER | Dashboard relawan: stats + riwayat + event mendatang |
| `/profile` | `app/profile/page.tsx` | Ya | Any | Edit profil, upload foto, lihat stats |
| `/settings` | `app/settings/page.tsx` | Ya | Any | Ganti password, notifikasi, zona bahaya |

### Halaman Admin (ADMIN)

| URL | File | Auth Required | Role | Redirect Jika Bukan Admin |
|-----|------|--------------|------|--------------------------|
| `/dashboard/admin` | `app/dashboard/admin/page.tsx` | Ya | ADMIN | `/dashboard` |
| `/dashboard/admin/events` | `app/dashboard/admin/events/page.tsx` | Ya | ADMIN | (via Sidebar check) |
| `/dashboard/admin/events/new` | `app/dashboard/admin/events/new/page.tsx` | Ya | ADMIN | — |
| `/dashboard/admin/events/:id/edit` | `app/dashboard/admin/events/[id]/edit/page.tsx` | Ya | ADMIN | — |
| `/dashboard/admin/events/:id/peserta` | `app/dashboard/admin/events/[id]/peserta/page.tsx` | Ya | ADMIN | `/dashboard/admin` (via fetch error) → `/dashboard` |
| `/dashboard/admin/events/:id/laporan` | `app/dashboard/admin/events/[id]/laporan/page.tsx` | Ya | ADMIN | — |
| `/dashboard/admin/relawan` | `app/dashboard/admin/relawan/page.tsx` | Ya | ADMIN | — |
| `/dashboard/admin/laporan` | `app/dashboard/admin/laporan/page.tsx` | Ya | ADMIN | — |

---

## 4. ALUR BISNIS PER FITUR

### 4.1 Autentikasi

#### Register

```
[User] Isi form (nama, email, password)
  → Validasi client: password < 6 char → toast error "Password minimal 6 karakter"
  → POST /auth/register { nama, email, password }
  → Backend: cek email unik, hash bcrypt(password, 10), create User(role=USER)
  → Jika email ada → 409 "Email sudah terdaftar"
  → Jika berhasil → POST /auth/login (auto-login)
  → setAuth(user, token) → localStorage + cookie
  → toast "Akun berhasil dibuat!"
  → Redirect ke /
```

#### Login (Email/Password)

```
[User] Isi form (email, password)
  → POST /auth/login { email, password }
  → Backend: cari user by email, bcrypt.compare(password, hash)
  → Jika salah → 401 "Email atau password salah"
  → Jika benar → JWT sign(sub=id, email, role, exp=7d)
  → Return { access_token, user }
  → Frontend: setAuth() → localStorage + cookie
  → toast "Selamat datang, {nama}!"
  → window.location.href = '/' (setelah 600ms delay)
```

#### Login (Google OAuth)

```
[User] Klik "Lanjutkan dengan Google"
  → GET /api/auth/google → Redirect ke Google consent
  → Google callback → GET /api/auth/google/callback
  → Jika user ada: login. Jika tidak: create user (role=USER, password='')
  → Redirect ke /oauth-callback?token=JWT&user=encodedJSON
  → Frontend: decode params → setAuth() → Redirect ke /
```

#### Logout

```
[User] Klik "Keluar" di Sidebar
  → logout() → localStorage.removeItem('pilar_token', 'pilar_user')
  → Zustand store: user=null, token=null
  → window.location.href = '/'
```

---

### 4.2 Dashboard Admin

```
[Admin] Akses /dashboard/admin
  → useEffect: loadFromStorage() + fetchData()
  → useEffect (user): if user.role !== 'ADMIN' → router.push('/dashboard')
  → GET /events/stats → { totalEvent, totalRelawan, totalSampahKg }
  → GET /events → list semua event
  → Render: 3 stat cards + tabel event dengan aksi
```

---

### 4.3 Profil Relawan

```
[User] Akses /profile
  → GET /users/profile → data user + _count
  → GET /users/stats → { totalEvent, totalSampahKg }
  
[Edit Profil]
  → Klik "Edit" → form aktif (nama, noHp, bio jadi input)
  → Simpan → PATCH /users/profile { nama, bio, noHp }
  → Update Zustand store + UI kembali ke view mode
  → toast "Profil berhasil diperbarui"

[Upload Foto]
  → Klik avatar → file input trigger
  → Pilih gambar (max 2MB, image/*)
  → POST /users/upload-foto (multipart)
  → Backend: simpan ke uploads/avatars/, update user.foto
  → Frontend: update avatar, update Zustand store
```

---

### 4.4 Event — View & Daftar oleh Relawan

```
[View Event List]
  → Homepage: GET /events?status=UPCOMING (max 6)
  → Tampil event card: judul, lokasi, tanggal, progress kuota

[View Event Detail]
  → GET /events/:id
  → Jika login: GET /pendaftaran/cek/:eventId → { terdaftar, status }
  → Tampil info card: tanggal, lokasi, kuota progress
  → Tampil tombol aksi:
    - Jika sudah daftar: tampil badge status
    - Jika kuota penuh: "Kuota sudah penuh"
    - Jika event DONE: "Event sudah selesai"
    - Jika belum daftar + login: "Daftar Jadi Relawan" → /events/:id/daftar
    - Jika belum login: "Masuk untuk Mendaftar" → /login

[Daftar Event — 5 Step Form]
  Step 1: Informasi Umum
    - Nama (auto-fill, disabled)
    - Email (auto-fill, disabled)
    - Nomor HP (input, required)
  
  Step 2: Identitas
    - NIK (text, maxLength=16, required)
    - Tanggal Lahir (date, required)
    - Alamat Lengkap (textarea, required)
  
  Step 3: Motivasi
    - Textarea (max 500 char, required)
    - Counter karakter tampil
  
  Step 4: Kondisi Kesehatan
    - 5 checkbox: jantung, asma, berjalan, alergi laut, hamil/menyusui
    - Nilai disimpan ke kesehatan object: { kondisi1: bool, ... }
  
  Step 5: Pernyataan Izin
    - Teks legal
    - Checkbox "Saya menyetujui..." (izin=true, required)
    - Jika submit tanpa centang → toast "Harap centang pernyataan izin"
  
  Submit → POST /pendaftaran { eventId, motivasi, kesehatan, izin, nik, alamat, tanggalLahir, noHp }
  → Validasi backend (event ada, tidak DONE, kuota cukup, belum daftar)
  → Create Pendaftaran(status=PENDING)
  → toast "Pendaftaran berhasil! Menunggu persetujuan admin."
  → Redirect ke /events/:id
```

---

### 4.5 Event CRUD oleh Admin

```
[Buat Event]
  → Akses /dashboard/admin/events/new
  → Form: judul, deskripsi, lokasi, tanggal (datetime-local), kuota (number), gambar (ImageUpload)
  → POST /events { judul, deskripsi, lokasi, tanggal, kuota: Number(kuota), gambar? }
  → toast "Event berhasil dibuat!", redirect ke /dashboard/admin

[Upload Gambar Event]
  → ImageUpload component → POST /events/upload-gambar (multipart, max 5MB)
  → Return URL → disimpan ke form.gambar

[Edit Event]
  → Akses /dashboard/admin/events/:id/edit
  → GET /events/:id → pre-fill form
  → PATCH /events/:id (same fields, semua optional)
  → toast "Event berhasil diperbarui"

[Hapus Event]
  → Klik "Hapus" di tabel → confirm("Hapus event ini?")
  → DELETE /events/:id
  → Refetch list
  → toast "Event dihapus"
```

---

### 4.6 Partisipasi — Daftar Peserta, Kelola Status

```
[Lihat Daftar Peserta]
  → Admin akses /dashboard/admin/events/:id/peserta
  → GET /events/:id → info event
  → GET /pendaftaran/event/:id → list semua pendaftar (include user info)
  → Tampil: header event, subtext "X pendaftar · Y diterima"
  → Filter tabs: ALL / PENDING / APPROVED / REJECTED (filter client-side)
  → Tiap kartu peserta: avatar, nama, email, status badge
  → Jika PENDING: tombol "Terima" + "Tolak"
  → Detail: NIK, No. HP, Tgl Lahir, Motivasi
  → Empty state: "Tidak ada data"

[Update Status Partisipasi]
  → Klik "Terima" → PATCH /pendaftaran/:id/status { status: 'APPROVED' }
  → toast "Relawan diterima"
  → Klik "Tolak" → PATCH /pendaftaran/:id/status { status: 'REJECTED' }
  → toast "Relawan ditolak"
  → Setelah update: fetchData() ulang

[Sinkronisasi Status]
  → Setelah APPROVED: peserta tampil di tab Diterima, tidak ada tombol aksi lagi
  → Setelah REJECTED: peserta tampil di tab Ditolak, tidak ada tombol aksi lagi
  → Di event detail (relawan): GET /pendaftaran/cek/:eventId update badge status
```

---

### 4.7 Monitoring / Laporan

```
[Lihat List Laporan]
  → Admin akses /dashboard/admin/laporan
  → GET /laporan → list events dengan _count
  → Tampil: judul, tanggal, lokasi, X relawan, Y foto

[Lihat Detail Laporan]
  → Klik event → GET /laporan/:eventId
  → Response: { event, ringkasan, peserta(APPROVED), dokumentasi, sampah }
  → Tampil: info event, ringkasan stats, daftar peserta, galeri foto, data sampah

[Input Laporan (Admin)]
  → Admin akses /dashboard/admin/events/:id/laporan
  → Input data sampah: POST /sampah { eventId, jenis, jumlahKg, catatan? }
  → Upload dokumentasi foto
  → Hapus data: DELETE /sampah/:id
```

---

## 5. SELECTOR UI PENTING (PLAYWRIGHT)

### CSS Class Selectors

#### Halaman Login (`/login`)

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| `.login-form-wrap` | `div` | Container form login |
| `.login-input` | `input[type="email"]` | Input email |
| `.login-input` | `input[type="password"]` | Input password |
| `.login-btn` | `button[type="submit"]` | Tombol "Masuk" |
| `.google-btn` | `a` | Tombol Google OAuth |

#### Halaman Register (`/register`)

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| `.reg-form-wrap` | `div` | Container form register |
| `.reg-input` | `input` | Input nama/email/password |
| `.reg-btn` | `button[type="submit"]` | Tombol "Buat Akun" |
| `.reg-google` | `a` | Tombol Google OAuth |

#### Form Event Daftar (`/events/:id/daftar`)

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| `.label` | `label` | Label form |
| `.input` | `input`, `textarea` | Input field |
| `.btn-primary` | `button` | Tombol Lanjut / Kirim |
| `.btn-secondary` | `button` | Tombol Kembali |

#### Form Buat / Edit Event (Admin)

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| `.input` | `input`, `textarea` | Field form event |
| `.label` | `label` | Label form |
| `.btn-primary` | `button` | Tombol Simpan |
| `.btn-secondary` | `button` | Tombol Batal |

#### Admin Dashboard

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| `.admin-stat` | `div` | Stat cards (3 kotak) |
| `.admin-row` | `tr` | Baris tabel event |
| `.admin-action` | `a`, `button` | Tombol Relawan, Edit, Hapus |
| `.admin-add-btn` | `a` | Tombol "Tambah Event" |

#### Kelola Event (`/dashboard/admin/events`)

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| `.ae-card` | `div` | Card event |
| `.ae-filter-btn` | `button` | Tab filter (ALL, UPCOMING, dst) |
| `.ae-action` | `button`, `a` | Aksi per event |
| `.ae-add-btn` | `a` | Tombol tambah event |

#### Halaman Peserta (`/dashboard/admin/events/:id/peserta`)

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| (role-based) | — | Tidak ada CSS class khusus; gunakan text selector |

#### Profil (`/profile`)

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| `.prof-card` | `div` | Kartu informasi profil |
| `.prof-avatar-wrap` | `div` | Container avatar (klik untuk upload) |
| `.prof-input` | `input`, `textarea` | Input edit profil |
| `.prof-btn-save` | `button` | Tombol Simpan |
| `.prof-stat` | `div` | Stat: Event Diikuti, Sampah (kg) |

#### Settings (`/settings`)

| Selector | Elemen | Keterangan |
|----------|--------|------------|
| `.input` | `input[type="password"]` | Input password |
| `.btn-primary` | `button` | Tombol Ganti Password |

---

### Text Content Selectors (Playwright `getByText`)

#### Navigasi & Auth

```
"Masuk ke akun PILAR kamu"   → Heading halaman login
"Buat akun baru"              → Heading halaman register
"Selamat datang, {nama}"     → Toast sukses login / heading dashboard admin
"Halo, {nama}"               → Heading dashboard relawan
"Keluar"                     → Tombol logout di Sidebar
```

#### Dashboard

```
"Dashboard Relawan"          → Label halaman dashboard user
"Dashboard Administrator"    → Label halaman dashboard admin
"Total Event Diikuti"        → Stat card user
"Pendaftaran Diterima"       → Stat card user
"Menunggu Verifikasi"        → Stat card user
"Total Event"                → Stat card admin
"Total Relawan"              → Stat card admin
"Sampah Terkumpul"           → Stat card admin
"Riwayat Pendaftaran"        → Section header
"Belum ada pendaftaran"      → Empty state riwayat
"Event Mendatang"            → Section header
"Tidak ada event mendatang"  → Empty state event
"Memuat..."                  → Loading state (semua halaman)
"Tambah Event"               → Tombol admin di dashboard
```

#### Event

```
"Pendaftaran Dibuka"         → Badge status event (UPCOMING)
"Sedang Berlangsung"         → Badge status event (ONGOING)
"Sudah Selesai"              → Badge status event (DONE)
"Tentang Event"              → Section detail event
"Daftar Jadi Relawan"        → Tombol daftar (user login, slot tersedia)
"Masuk untuk Mendaftar"      → Tombol daftar (user belum login)
"Kuota sudah penuh"          → Info kuota habis
"Event sudah selesai"        → Info event done
"Bagikan Event"              → Tombol share
"Link event disalin!"        → Toast setelah share
```

#### Form Pendaftaran (5 Step)

```
"Informasi Umum"             → Judul step 1
"Identitas Diri"             → Judul step 2
"Motivasi"                   → Judul step 3
"Kondisi Kesehatan"          → Judul step 4
"Pernyataan Izin"            → Judul step 5
"NIK (Nomor Induk Kependudukan)"   → Label field
"Tidak memiliki penyakit jantung"  → Checkbox kesehatan 1
"Tidak memiliki asma"              → Checkbox kesehatan 2
"Mampu berjalan jauh"              → Checkbox kesehatan 3
"Tidak alergi terhadap lingkungan laut"  → Checkbox kesehatan 4
"Tidak dalam kondisi hamil atau menyusui"→ Checkbox kesehatan 5
"Saya menyetujui pernyataan"       → Checkbox izin step 5
"Kirim Pendaftaran"                → Tombol submit
"Harap centang pernyataan izin"    → Toast error validasi
"Pendaftaran berhasil! Menunggu persetujuan admin."  → Toast sukses
```

#### Halaman Peserta (Admin)

```
"Verifikasi Relawan"    → Label halaman (section subtitle)
"Tidak ada data"        → Empty state kartu peserta
"Semua"                 → Tab filter ALL
"Menunggu"              → Tab filter PENDING
"Diterima"              → Tab filter APPROVED
"Ditolak"               → Tab filter REJECTED
"Terima"                → Tombol approve peserta
"Tolak"                 → Tombol reject peserta
"Relawan diterima"      → Toast sukses approve
"Relawan ditolak"       → Toast sukses reject
"NIK"                   → Label di kartu peserta (muncul per kartu)
"No. HP"                → Label di kartu peserta
"Tgl. Lahir"            → Label di kartu peserta
"Input Laporan"         → Link di header halaman peserta
```

#### Profil & Settings

```
"Informasi Profil"               → Card header di profil
"Ganti foto profil"              → Tombol upload foto
"Event Diikuti"                  → Stat label profil
"Sampah (kg)"                    → Stat label profil
"Simpan"                         → Tombol save profil
"Batal"                          → Tombol cancel edit
"Profil berhasil diperbarui"     → Toast sukses update profil
"Ganti Password"                 → Tombol di settings
"Password Saat Ini"              → Label input
"Password Baru"                  → Label input
"Konfirmasi Password Baru"       → Label input
"Password berhasil diubah"       → Toast sukses ganti password
"Konfirmasi password tidak cocok"→ Toast error validasi
"Password baru minimal 6 karakter" → Toast error validasi
"Hapus Akun Saya"                → Tombol zona bahaya (non-fungsional)
```

### Input Placeholders

```
"email@kamu.com"           → Input email di login & register
"••••••••"                 → Input password
"Nama kamu"                → Input nama di register
"Min. 6 karakter"          → Input password di register
"Contoh: Bersih Pantai Kuta"  → Input judul event
"Deskripsikan kegiatan..."    → Textarea deskripsi event
"Pantai Kuta, Bali"           → Input lokasi event
"08xxxxxxxxxx"                → Input nomor HP
"16 digit NIK"                → Input NIK
"Jl. ..."                     → Textarea alamat
"Tuliskan motivasimu di sini..." → Textarea motivasi
```

### Attribute Selectors

```typescript
// Input types
page.locator('input[type="email"]')
page.locator('input[type="password"]')
page.locator('input[type="text"]')
page.locator('input[type="tel"]')
page.locator('input[type="date"]')
page.locator('input[type="datetime-local"]')
page.locator('input[type="number"]')

// NIK field
page.locator('input[maxlength="16"]')

// Disabled fields (auto-fill di step 1 form daftar)
page.locator('input:disabled')

// File input (upload foto/gambar)
page.locator('input[type="file"]')
```

---

## 6. DATA & KONDISI YANG DIBUTUHKAN UNTUK TESTING

### 6.1 Akun Test

Simpan di `pilar-frontend/.env.test` (jangan di-commit ke git):

```env
# Akun admin yang sudah ada di database
TEST_ADMIN_EMAIL=admin@pilar.id
TEST_ADMIN_PASSWORD=admin123

# Akun relawan (USER role)
TEST_RELAWAN_EMAIL=relawan@pilar.id
TEST_RELAWAN_PASSWORD=relawan123
```

### 6.2 Contoh Data Valid Per Fitur

#### Register

```json
{
  "nama": "Relawan Test",
  "email": "test.relawan.{{timestamp}}@pilar.id",
  "password": "test123"
}
```
> Gunakan timestamp/random suffix agar email selalu unik.

#### Login

```json
{
  "email": "relawan@pilar.id",
  "password": "relawan123"
}
```

#### Buat Event (Admin)

```json
{
  "judul": "[TEST] Bersih Pantai Test",
  "deskripsi": "Kegiatan pembersihan pantai untuk keperluan testing",
  "lokasi": "Pantai Test, Jakarta",
  "tanggal": "2026-06-01T08:00",
  "kuota": 10
}
```

#### Form Pendaftaran Event (5 Step)

```json
{
  "noHp": "081234567890",
  "nik": "1234567890123456",
  "tanggalLahir": "2000-01-15",
  "alamat": "Jl. Test No. 1, Jakarta Selatan",
  "motivasi": "Saya ingin berkontribusi menjaga kebersihan laut Indonesia karena peduli lingkungan.",
  "kesehatan": {
    "jantung": true,
    "asma": true,
    "berjalan": true,
    "alergi": true,
    "hamil": true
  },
  "izin": true
}
```

#### Update Profil

```json
{
  "nama": "Nama Baru Test",
  "bio": "Relawan aktif yang peduli lingkungan.",
  "noHp": "089876543210"
}
```

#### Ganti Password

```json
{
  "passwordLama": "relawan123",
  "passwordBaru": "newpass456",
  "konfirmasi": "newpass456"
}
```

#### Input Sampah

```json
{
  "jenis": "Plastik",
  "jumlahKg": 5.5,
  "catatan": "Mayoritas botol plastik"
}
```

---

### 6.3 Contoh Data Invalid Per Fitur

#### Register — Validasi Gagal

| Kasus | Data | Expected Error |
|-------|------|----------------|
| Email duplikat | email: `admin@pilar.id` (sudah ada) | `409` "Email sudah terdaftar" |
| Password terlalu pendek | password: `"12345"` (5 char) | Client toast: "Password minimal 6 karakter" |
| Email tidak valid | email: `"bukan-email"` | HTML5 validation (tidak submit) |
| Nama kosong | nama: `""` | HTML5 required (tidak submit) |

#### Login — Validasi Gagal

| Kasus | Data | Expected Error |
|-------|------|----------------|
| Password salah | password: `"salah999"` | `401` "Email atau password salah" |
| Email tidak terdaftar | email: `"tidak.ada@pilar.id"` | `401` "Email atau password salah" |

#### Form Pendaftaran — Validasi Gagal

| Kasus | Kondisi | Expected Error |
|-------|---------|----------------|
| Kuota penuh | Event.pendaftaran >= Event.kuota | `400` "Kuota event sudah penuh" |
| Sudah daftar | userId+eventId sudah ada di DB | `400` "Kamu sudah mendaftar di event ini" |
| Event selesai | Event.status === 'DONE' | `400` "Event sudah selesai" |
| Tanpa centang izin | izin: false saat step 5 submit | Toast "Harap centang pernyataan izin" |

#### Ganti Password — Validasi Gagal

| Kasus | Data | Expected Error |
|-------|------|----------------|
| Password lama salah | passwordLama: `"salah"` | `400` "Password lama salah" |
| Konfirmasi tidak cocok | passwordBaru ≠ konfirmasi | Client toast: "Konfirmasi password tidak cocok" |
| Password baru terlalu pendek | passwordBaru: `"abc"` | Client toast: "Password baru minimal 6 karakter" |

#### Akses Tidak Sah (Role)

| Kasus | Kondisi | Expected Behavior |
|-------|---------|-------------------|
| USER akses `/dashboard/admin` | user.role === 'USER' | Redirect ke `/dashboard` |
| USER akses `/dashboard/admin/events/:id/peserta` | user.role === 'USER' | API 403 → redirect `/dashboard/admin` → redirect `/dashboard` |
| Tanpa login akses endpoint protected | Tanpa Bearer token | `401 UnauthorizedException` |
| USER panggil `POST /events` | user.role === 'USER' | `403 ForbiddenException` |

---

### 6.4 State Awal yang Dibutuhkan Sebelum Test

#### TC.001 — Admin Lihat Peserta (Event Ada Peserta)
- Ada minimal 1 event di DB
- Ada minimal 1 pendaftaran (status: PENDING/APPROVED/REJECTED) pada event tersebut
- **Cara verifikasi**: `GET /events` → cari `_count.pendaftaran > 0`

#### TC.002 — Admin Lihat Peserta (Event Kosong)
- Event dibuat fresh via `POST /events` oleh admin (auto: 0 pendaftaran)
- **Cleanup**: Hapus event setelah test via `DELETE /events/:id`

#### TC.003 — Relawan Akses Admin Page
- Akun relawan (role: USER) sudah ada di DB
- Minimal 1 event ada di DB (untuk target URL)

#### Form Pendaftaran (Happy Path)
- User sudah login (token valid)
- Event ada di DB, status bukan DONE, kuota belum penuh
- User BELUM pernah daftar event yang sama

#### Form Pendaftaran (Kuota Penuh)
- Event ada dengan kuota, misalnya kuota=1 dan sudah ada 1 APPROVED pendaftaran

#### Ganti Password (Happy Path)
- User login
- Tahu password lama yang benar

---

### 6.5 Setup Test Helper yang Sudah Tersedia

File: `pilar-frontend/tests/e2e/helpers/auth.ts`

```typescript
loginViaAPI(request, email, password)      // → { token, user }
setAuthInBrowser(page, token, user)        // Inject ke localStorage + cookie
getEventsViaAPI(request, token)            // → events[]
createEventViaAPI(request, token, payload) // → created event
deleteEventViaAPI(request, token, eventId) // Cleanup test event
```

---

### 6.6 Checklist Pre-Test (Sebelum Jalankan Test)

```
[ ] Backend berjalan di http://localhost:3001
[ ] Frontend berjalan di http://localhost:3000
[ ] Database (PostgreSQL Supabase) dapat diakses
[ ] .env.test sudah diisi dengan credential yang benar
[ ] Akun admin (TEST_ADMIN_EMAIL) sudah ada di DB dengan role=ADMIN
[ ] Akun relawan (TEST_RELAWAN_EMAIL) sudah ada di DB dengan role=USER
[ ] Minimal 1 event ada di DB
[ ] Minimal 1 event memiliki peserta terdaftar (untuk TC.001 dan sejenisnya)
```

---

*Dokumen ini di-generate berdasarkan eksplorasi kode sumber per 2026-05-03.*
*Update dokumen ini setiap ada perubahan endpoint, UI selector, atau alur bisnis.*
