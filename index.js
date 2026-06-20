const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const PORT = process.env.PORT || 8080;

const STUDENT = { name: 'Mikail Samyth Habibillah', nim: '2411523016' };

// ROOT
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is running',
    student: STUDENT
  });
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
      name: 'games',
      label: 'Data Game',
      description: 'Aplikasi untuk mengelola data game'
    },
    fields: [
      { name: 'title', label: 'Judul Game', type: 'text', required: true, showInTable: true },
      { name: 'genre', label: 'Genre', type: 'text', required: true, showInTable: true },
      { name: 'platform', label: 'Platform', type: 'text', required: true, showInTable: true },
      { name: 'release_year', label: 'Tahun Rilis', type: 'number', required: false, showInTable: true },
      { name: 'developer', label: 'Developer', type: 'text', required: false, showInTable: true },
      { name: 'rating', label: 'Rating', type: 'number', required: false, showInTable: true }
    ],
    endpoints: {
      list: '/games',
      detail: '/games/{id}',
      create: '/games',
      update: '/games/{id}',
      delete: '/games/{id}'
    }
  });
});

// GET semua
app.get('/games', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT id, title, genre, platform, release_year, developer, CAST(rating AS FLOAT) as rating, created_at FROM games ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM games');

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
app.get('/games/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ status: 'error', message: 'Data not found' });
    res.json({ status: 'success', message: 'Data retrieved successfully', data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST
app.post('/games', async (req, res) => {
  try {
    const { title, genre, platform, release_year, developer, rating } = req.body;
    const [result] = await pool.query(
      'INSERT INTO games (title, genre, platform, release_year, developer, rating) VALUES (?, ?, ?, ?, ?, ?)',
      [title, genre, platform, release_year, developer, rating]
    );
    const [newGame] = await pool.query('SELECT * FROM games WHERE id = ?', [result.insertId]);
    res.status(201).json({ status: 'success', message: 'Data created successfully', data: newGame[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT
app.put('/games/:id', async (req, res) => {
  try {
    const { title, genre, platform, release_year, developer, rating } = req.body;
    await pool.query(
      'UPDATE games SET title=?, genre=?, platform=?, release_year=?, developer=?, rating=? WHERE id=?',
      [title, genre, platform, release_year, developer, rating, req.params.id]
    );
    const [updated] = await pool.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Data updated successfully', data: updated[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE
app.delete('/games/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM games WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
