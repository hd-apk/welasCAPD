# WELAS CAPD (PWA)
Aplikasi pendamping pasien CAPD. Isi: index.html, app.js, config.js, manifest.webmanifest, sw.js, icons/, Code.gs (Google Apps Script).
Panduan lengkap (Apps Script > GitHub/Netlify > install HP > APK): lihat dokumen "Panduan WELAS CAPD".
Ringkas: 1) tempel Code.gs di Apps Script, deploy Web app. 2) isi config.js. 3) upload ke Netlify atau GitHub Pages.
PERINGATAN: repo GitHub publik = semua file terbaca semua orang. Biarkan config.js KOSONG dan jangan tulis token asli di repo. Sambungkan server lewat link aktivasi (#k=...) yang dibuat fungsi buatLinkAktivasi() di Code.gs dan dibagikan secara pribadi.

## Kalender Catatan Harian
Ketuk tanggal di halaman Catatan Harian untuk membuka kalender pengisian:
- Hijau = 4 siklus atau lebih (lengkap)
- Kuning = 1-3 siklus (kurang), angka kecil di bawah tanggal = jumlah siklus terisi
- Putih = belum diisi
Geser bulan dengan tombol panah untuk mencari tanggal yang kosong atau kurang.
