function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Format JSON tidak valid' });
  }
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
}

module.exports = { notFound, errorHandler };