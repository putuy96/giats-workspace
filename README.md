# GIATS Workspace — Aplikasi Terpasang (PWA)

Berkas di folder ini membungkus GIATS Workspace (Apps Script) menjadi aplikasi yang dapat dipasang di layar utama ponsel dan komputer, serta tetap terbuka saat internet terputus.

## Mengapa perlu folder ini

Apps Script tidak mengizinkan Service Worker, sehingga alamat `/exec` tidak dapat dipasang sebagai aplikasi dan tidak dapat terbuka tanpa internet. Folder ini diunggah ke hosting statis (GitHub Pages), lalu memuat `/exec` di dalamnya. Service Worker berjalan di hosting tersebut.

## Isi folder

| Berkas | Fungsi |
|---|---|
| `index.html` | Memuat GIATS Workspace; bila tidak ada internet, menampilkan ringkasan terakhir |
| `sw.js` | Service Worker: menyimpan kerangka aplikasi agar terbuka tanpa internet |
| `manifest.webmanifest` | Nama, warna, dan ikon aplikasi terpasang |
| `ikon-*.png`, `apple-touch-icon.png`, `favicon.png` | Ikon dari logo GIATS |

## Memasang di GitHub Pages

1. Buat akun di github.com (bila belum ada).
2. Buat repositori baru, misalnya `giats-workspace`, jenis **Public**.
3. Pilih **Add file → Upload files**, unggah seluruh isi folder ini (bukan foldernya), lalu **Commit changes**.
4. Buka **Settings → Pages**. Pada **Branch** pilih `main` dan folder `/ (root)`, lalu **Save**.
5. Tunggu 1–2 menit. Alamat aplikasi menjadi `https://<nama-akun>.github.io/giats-workspace/`.

Repositori publik hanya berisi kerangka dan ikon. Data tetap berada di Google dan tetap memerlukan login Nama + PIN.

## Memasang di perangkat

- **Android (Chrome):** buka alamat GitHub Pages → menu ⋮ → **Instal aplikasi** / **Tambahkan ke layar utama**.
- **iPhone (Safari):** buka alamat → tombol Bagikan → **Tambahkan ke Layar Utama**.
- **Komputer (Chrome/Edge):** ikon pasang di kolom alamat.

Membuka aplikasi tertentu langsung: tambahkan `?app=roster` (atau `proposal`, `surat`, `hr`, `invoice`, `petty`) di belakang alamat. Bila aplikasi terpasang terlanjur membuka alamat Apps Script langsung (bilah "script.google.com" di atas), buka sekali `./?bingkai=1` di peramban untuk kembali ke mode bingkai.

## Perilaku tanpa internet

| Keadaan | Yang terjadi |
|---|---|
| Aplikasi dibuka tanpa internet | Tampil ringkasan terakhir (jumlah karyawan aktif, kontrak habis, invoice, surat) beserta waktu penyimpanannya, dan tombol **Coba sambungkan lagi** |
| Internet terputus saat bekerja | Pita oranye muncul di atas; tindakan (simpan, terbit) ditahan dan dikirim otomatis begitu tersambung |
| Koneksi putus tepat saat mengirim | Muncul pesan untuk memeriksa dulu apakah data sudah tersimpan sebelum mengulang |

Ringkasan yang disimpan hanya berisi angka, tanpa nama karyawan dan tanpa nominal uang.

## Pemberitahuan dorong (push)

| Langkah | Yang terjadi |
|---|---|
| Setelah masuk | Muncul tawaran **Aktifkan pemberitahuan** di bawah layar (sekali; bila memilih **Nanti**, ditawarkan lagi setelah 14 hari) |
| Menekan **Aktifkan** | Perangkat meminta izin, berlangganan ke layanan push peramban, lalu langganannya didaftarkan ke akun yang sedang masuk (lembar "Langganan Push" di buku data Workspace) |
| Ada kejadian Petty Cash | Ajuan menunggu verifikasi/persetujuan, siap dicairkan, dana macet, dan status ajuan pemohon dikirim ke perangkat akun yang bersangkutan |
| Mengetuk pemberitahuan | Aplikasi terbuka langsung di Petty Cash |
| Keluar dari akun | Langganan perangkat itu dilepas, sehingga akun berikutnya di perangkat yang sama tidak menerima pemberitahuan akun sebelumnya |

- Push yang dikirim server tidak berisi apa pun. `sw.js` mengambil isi pesannya dari Apps Script memakai kunci langganan, sehingga isi pesan tidak melewati server push pihak lain.
- iPhone/iPad: minimal iOS 16.4 dan aplikasi **harus** dipasang ke Layar Utama; dari Safari biasa tidak bisa.
- Android: Chrome, Edge, Samsung Internet, atau Firefox.
- Mematikan: pengaturan pemberitahuan situs/aplikasi di perangkat.

## Catatan

- Login di aplikasi terpasang terpisah dari login di alamat `/exec` biasa, karena peramban memisahkan penyimpanan per situs. Cukup login sekali di aplikasi terpasang.
- Bila alamat deployment Apps Script berganti, ubah nilai `ALAMAT` di `index.html`.
- Setelah mengubah berkas di GitHub, naikkan nilai `VERSI` di `sw.js` (misalnya `gw-kerangka-2`) agar perangkat mengambil salinan baru.
- Tulisan "Aplikasi ini dibuat oleh pengguna Google Apps Script" di bagian atas berasal dari Google dan tidak dapat dihilangkan untuk akun Gmail biasa.
