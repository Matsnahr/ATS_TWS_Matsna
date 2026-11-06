const express = require('express');
const db = require('../db');
const router = express.Router();

// GET ALL LOANS
router.get('/', (req, res) => {
  const loans = db.prepare(`
    SELECT l.id, l.book_id, b.title AS book_title, l.member_id, m.name AS member_name, l.loan_date, l.return_date
    FROM loans l
    JOIN books b ON l.book_id = b.id
    JOIN members m ON l.member_id = m.id
    ORDER BY l.id DESC
  `).all();
  res.json({ success: true, data: loans });
});

// POST /loans (Meminjam Buku)
router.post('/', (req, res) => {
  const { book_id, member_id } = req.body;
  if (!book_id || !member_id) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: ['book_id dan member_id wajib diisi']
    });
  }

  // Cek Keberadaan Buku
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  }

  // Cek Keberadaan Member
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(member_id);
  if (!member) {
    return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
  }

  // Cek Apakah Buku Sedang Dipinjam & Belum Dikembalikan
  const activeLoan = db
    .prepare('SELECT * FROM loans WHERE book_id = ? AND return_date IS NULL')
    .get(book_id);

  if (activeLoan) {
    return res.status(400).json({
      success: false,
      message: 'Buku sedang dipinjam oleh anggota lain dan belum dikembalikan'
    });
  }

  const result = db
    .prepare('INSERT INTO loans (book_id, member_id) VALUES (?, ?)')
    .run(book_id, member_id);

  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ success: true, data: loan });
});

// PUT /loans/:id/return (Mengembalikan Buku)
router.put('/:id/return', (req, res) => {
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);

  if (!loan) {
    return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan' });
  }

  if (loan.return_date !== null) {
    return res.status(400).json({ success: false, message: 'Buku ini sudah dikembalikan sebelumnya' });
  }

  const returnDate = new Date().toISOString();
  db.prepare('UPDATE loans SET return_date = ? WHERE id = ?').run(returnDate, req.params.id);

  const updatedLoan = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
  res.json({ success: true, message: 'Buku berhasil dikembalikan', data: updatedLoan });
});

module.exports = router;