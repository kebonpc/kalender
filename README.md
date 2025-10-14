# Generator Kalender Cetak

Aplikasi web sisi-klien untuk membuat kalender tahunan yang dapat dicetak. Aplikasi ini dirancang untuk berfungsi sepenuhnya secara offline setelah dimuat pertama kali.

## Fitur Utama

-   **Tata Letak Fleksibel**: Menampilkan dua bulan per halaman.
-   **Kustomisasi Gambar**: Pengguna dapat mengunggah gambar kustom yang berbeda untuk setiap halaman kalender.
-   **Sistem Multi-Kalender**: Menampilkan tanggal Gregorian, Jawa (Pasaran), dan Islam (Hijriah) secara bersamaan.
-   **Tanggal Libur Nasional**: Secara otomatis menampilkan hari libur nasional Indonesia.
-   **Tanggal Khusus**: Pengguna dapat menambahkan tanggal khusus seperti ulang tahun atau acara pribadi.
-   **Ekspor ke PDF**: Menghasilkan dokumen PDF multi-halaman berkualitas tinggi yang siap untuk dicetak.
-   **Fungsi Offline**: Dapat digunakan tanpa koneksi internet.

## Prasyarat

Pastikan Anda memiliki [Node.js](https://nodejs.org/) (yang sudah termasuk `npm`) terinstal di sistem Anda.

## Instalasi & Penyiapan Lingkungan Pengembangan

1.  **Clone repository ini:**
    ```bash
    git clone <URL_REPOSITORY_ANDA>
    cd kalender
    ```

2.  **Instal dependensi proyek:**
    Jalankan perintah berikut di direktori root proyek untuk menginstal semua paket yang diperlukan.
    ```bash
    npm install
    ```

### Menjalankan Server Pengembangan

Untuk memulai server pengembangan lokal dengan fitur *hot-reload* (otomatis memuat ulang halaman saat ada perubahan kode), jalankan perintah:

```bash
npm run dev
```

Perintah ini akan membuka aplikasi di browser default Anda. Server ini sangat ideal untuk pengembangan karena Anda dapat melihat perubahan secara langsung.

### Membuat Build Produksi

Ketika Anda siap untuk men-deploy aplikasi, Anda perlu membuat versi produksi yang sudah dioptimalkan (file JavaScript dan CSS diminifikasi dan digabung).

Jalankan perintah berikut:

```bash
npm run build
```

Perintah ini akan membuat direktori `dist/` baru yang berisi semua file yang siap untuk diunggah ke server web atau GitHub Pages.