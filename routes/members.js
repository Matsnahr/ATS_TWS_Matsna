const express = require('express');
const db = require('../db');
const router = express.Router();

// Fungsi Validasi Input Anggota
function validateMember(body) {
  const errors = [];
  const { name, email } = body;
  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('name wajib diisi (teks)');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== 'string' || !emailRegex.test(email)) {
    errors.push('email harus berupa alamat email yang valid');
  }
  return errors;
}

// GET ALL MEMBERS
router.get('/', (req, res) => {
  const members = db.prepare('SELECT * FROM members ORDER BY id DESC').all();
  res.json({ success: true, data: members });
});

// GET MEMBER BY ID
router.get('/:id', (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
  res.json({ success: true, data: member });
});

// GET LOAN HISTORY OF A MEMBER
router.get('/:id/loans', (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });

  const loans = db.prepare(`
    SELECT l.id AS loan_id, b.id AS book_id, b.title, b.author, l.loan_date, l.return_date 
    FROM loans l
    JOIN books b ON l.book_id = b.id
    WHERE l.member_id = ?
    ORDER BY l.id DESC
  `).all(req.params.id);

  res.json({ success: true, member, loans });
});

// CREATE MEMBER
router.post('/', (req, res) => {
  const errors = validateMember(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors });
  }

  const { name, email } = req.body;
  try {
    const result = db
      .prepare('INSERT INTO members (name, email) VALUES (?, ?)')
      .run(name, email);

    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newMember });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }
    throw err;
  }
});

// UPDATE MEMBER
router.put('/:id', (req, res) => {
  const errors = validateMember(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors });
  }

  const { name, email } = req.body;
  try {
    const result = db
      .prepare('UPDATE members SET name = ?, email = ? WHERE id = ?')
      .run(name, email, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
    }

    const updatedMember = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updatedMember });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }
    throw err;
  }
});

// DELETE MEMBER
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
  }
  res.json({ success: true, message: 'Anggota berhasil dihapus' });
});

module.exports = router;