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

## Detail Implementasi & Metode Perhitungan

Untuk memastikan akurasi, generator ini menggunakan beberapa metode perhitungan:

-   **Kalender Jawa**:
    -   **Pasaran**: Hari Pasaran (Legi, Pahing, Pon, Wage, Kliwon) dihitung menggunakan operasi modulo terhadap jumlah hari yang telah berlalu sejak epoch tetap, memastikan siklus 5 hari yang konsisten.

-   **Kalender Islam (Hijriah)**:
    -   Perhitungan tanggal utama menggunakan API `Intl.DateTimeFormat` bawaan browser dengan kalender `islamic-umalqura` yang terstandarisasi.
    -   Sebuah pemetaan kustom digunakan untuk menyesuaikan nama-nama bulan (misalnya, "Syakban" menjadi "Sya'ban") agar sesuai dengan ejaan yang umum digunakan di Indonesia.

-   **Hari Libur Nasional**:
    -   Menggunakan pendekatan hybrid: hari libur dengan tanggal tetap (seperti 1 Januari), data yang telah dihitung sebelumnya dari `holidays.json` untuk hari libur tak tetap (seperti Nyepi & Waisak), dan perhitungan algoritmis untuk hari libur Islam berdasarkan tanggalnya di kalender Hijriah.

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