# Simple Order App

Aplikasi Simple Order adalah aplikasi web untuk melakukan pemesanan produk secara online. Terdiri dari backend (Node.js/Express, MongoDB) dan frontend (Vue 3, Tailwind CSS).

## Fitur

- Login & Logout
- Daftar produk
- Buat pesanan
- Riwayat pesanan
- Notifikasi dan validasi

## Cara Menjalankan

1. Pastikan Docker dan Docker Compose sudah terinstall.
2. Jalankan perintah berikut:
   ```bash
   docker compose up --build
   ```
3. Akses aplikasi di browser:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## Endpoint API

### Autentikasi

- `POST /api/auth/login` — Login user
- `POST /api/auth/logout` — Logout user
- `GET /api/auth/me` — Info user yang login

### Produk

- `GET /api/products` — Daftar produk

### Pesanan

- `POST /api/orders` — Buat pesanan baru
- `GET /api/orders` — Lihat riwayat pesanan


## Akun Awal

Saat pertama kali dijalankan, akun superadmin akan dibuat otomatis dengan data berikut:

- Nama: Admin
- Email: admin@example.com
- Password: admin123

## Lisensi

MIT
SUBDOMAIN