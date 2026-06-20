const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const PORT = process.env.PORT || 8080;
const STUDENT = { name: 'Mikail Samyth Habibillah', nim: '2411523016' };

// ROOT
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Backend is running', student: STUDENT });
});

// HEALTH
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'success',
      message: 'Backend is running',
      database: 'connected',
      student: STUDENT
    });
  } catch {
    res.json({
      status: 'error',
      message: 'Backend is running, but database is not connected',
      database: 'disconnected',
      student: STUDENT
    });
  }
});

// SCHEMA
app.get('/schema', (req, res) => {
  res.json({
    student: STUDENT,
    resource: {
      name: 'animes',
      label: 'Data Anime Series',
      description: 'Aplikasi untuk mengelola koleksi anime series'
    },
    fields: [
      { name: 'title', label: 'Judul Anime', type: 'text', required: true, showInTable: true },
      { name: 'studio', label: 'Studio', type: 'text', required: true, showInTable: true },
      { name: 'genre', label: 'Genre', type: 'text', required: true, showInTable: true },
      { name: 'episodes', label: 'Jumlah Episode', type: 'number', required: false, showInTable: true },
      { name: 'release_year', label: 'Tahun Rilis', type: 'number', required: false, showInTable: true },
      { name: 'status', label: 'Status', type: 'text', required: false, showInTable: true },
      { name: 'mal_score', label: 'MAL Score', type: 'number', required: false, showInTable: true }
    ],
    endpoints: {
      list: '/animes',
      detail: '/animes/{id}',
      create: '/animes',
      update: '/animes/{id}',
      delete: '/animes/{id}'
    }
  });
});

// GET semua
app.get('/animes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT id, title, studio, genre, episodes, release_year, status, CAST(mal_score AS FLOAT) as mal_score, created_at FROM animes ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM animes');

    res.json({
      status: 'success',
      message: 'Data retrieved successfully',
      total: total,
      data: rows
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET by ID
app.get('/animes/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, studio, genre, episodes, release_year, status, CAST(mal_score AS FLOAT) as mal_score, created_at FROM animes WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ status: 'error', message: 'Data not found' });
    res.json({ status: 'success', message: 'Data retrieved successfully', data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST
app.post('/animes', async (req, res) => {
  try {
    const { title, studio, genre, episodes, release_year, status, mal_score } = req.body;
    const [result] = await pool.query(
      'INSERT INTO animes (title, studio, genre, episodes, release_year, status, mal_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, studio, genre, episodes, release_year, status, mal_score]
    );
    const [newAnime] = await pool.query('SELECT * FROM animes WHERE id = ?', [result.insertId]);
    res.status(201).json({ status: 'success', message: 'Data created successfully', data: newAnime[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT
app.put('/animes/:id', async (req, res) => {
  try {
    const { title, studio, genre, episodes, release_year, status, mal_score } = req.body;
    await pool.query(
      'UPDATE animes SET title=?, studio=?, genre=?, episodes=?, release_year=?, status=?, mal_score=? WHERE id=?',
      [title, studio, genre, episodes, release_year, status, mal_score, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM animes WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Data updated successfully', data: updated[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE
app.delete('/animes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM animes WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
