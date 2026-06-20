# Backend Tugas Besar Cloud Computing 2026

Backend REST API untuk Tugas Besar mata kuliah Cloud Computing 2026 — Aplikasi Manajemen Data Game.

## 👤 Identitas

- **Nama:** Mikail Samyth Habibillah
- **NIM:** 2411523016
- **Tema:** Aplikasi Manajemen Data Game

## 🚀 Deployment

| Komponen | Layanan | URL |
|----------|---------|-----|
| Backend | Google Cloud Run | https://be-2411523016-64289881252.asia-southeast2.run.app |
| Frontend | Google App Engine | https://fe-2411523016-dot-komputasi-awan-2026-6.an.r.appspot.com |
| Database | MariaDB di Compute Engine VM | — |

## 🛠️ Teknologi

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MariaDB
- **Library:** mysql2, cors, dotenv

## 📡 Daftar Endpoint

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/health` | Cek status backend dan database |
| GET | `/schema` | Ambil struktur data resource |
| GET | `/games` | Ambil semua data game (pagination support) |
| GET | `/games/:id` | Ambil detail game by ID |
| POST | `/games` | Tambah data game baru |
| PUT | `/games/:id` | Update data game |
| DELETE | `/games/:id` | Hapus data game |

## 🗄️ Struktur Tabel Database

```sql
CREATE TABLE games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  release_year INT,
  developer VARCHAR(255),
  rating DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ⚙️ Cara Menjalankan Lokal

1. Clone repository:
```bash
   git clone https://github.com/[username]/be-2411523016.git
   cd be-2411523016
```

2. Install dependencies:
```bash
   npm install
```

3. Buat file `.env`:
```env
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=db_2411523016
   DB_PORT=3306
   PORT=8080
```

4. Jalankan server:
```bash
   node index.js
```

5. Akses: `http://localhost:8080/health`

## ☁️ Deploy ke Cloud Run

```bash
gcloud run deploy be-2411523016 \
  --source . \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=...,DB_USER=...,DB_PASS=...,DB_NAME=...,DB_PORT=3306
```

## 📄 Contoh Response

### GET /health
```json
{
  "status": "success",
  "message": "Backend is running",
  "database": "connected",
  "student": {
    "name": "Mikail Samyth Habibillah",
    "nim": "2411523016"
  }
}
```

### GET /games
```json
{
  "status": "success",
  "message": "Data retrieved successfully",
  "total": 9,
  "data": [
    {
      "id": 1,
      "title": "Minecraft",
      "genre": "Sandbox",
      "platform": "PC",
      "release_year": 2011,
      "developer": "Mojang",
      "rating": 9.5
    }
  ]
}
```

## 📝 Lisensi

Tugas akademik — Universitas Andalas 2026
