const express = require('express');
const db = require('../db');
const router = express.Router();

function validateBook(body) {
  const errors = [];
  const { title, author, year } = body;
  if (typeof title !== 'string' || title.trim() === '') {
    errors.push('title wajib diisi (teks)');
  }
  if (typeof author !== 'string' || author.trim() === '') {
    errors.push('author wajib diisi (teks)');
  }
  if (year !== undefined && (!Number.isInteger(year) || year < 1000 || year > 2100)) {
    errors.push('year harus berupa angka bulat antara 1000 dan 2100');
  }
  return errors;
}

// READ ALL + Search & Pagination
router.get('/', (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const offset = (page - 1) * limit;
  const title = `%${req.query.title || ''}%`;

  const total = db
    .prepare('SELECT COUNT(*) AS total FROM books WHERE title LIKE ?')
    .get(title).total;

  const data = db
    .prepare('SELECT * FROM books WHERE title LIKE ? ORDER BY id LIMIT ? OFFSET ?')
    .all(title, limit, offset);

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

// READ ONE
router.get('/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  res.json({ success: true, data: book });
});

// CREATE
router.post('/', (req, res) => {
  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors });
  }

  const { title, author, year } = req.body;
  const result = db
    .prepare('INSERT INTO books (title, author, year) VALUES (?, ?, ?)')
    .run(title, author, year || null);

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: book });
});

// UPDATE
router.put('/:id', (req, res) => {
  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors });
  }

  const { title, author, year } = req.body;
  const result = db
    .prepare('UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?')
    .run(title, author, year || null, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  }

  const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: updatedBook });
});

// DELETE
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  }
  res.json({ success: true, message: 'Buku berhasil dihapus' });
});

module.exports = router;