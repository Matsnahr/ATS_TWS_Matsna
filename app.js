const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');

const booksRouter = require('./routes/books');
const membersRouter = require('./routes/members');
const loansRouter = require('./routes/loans');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = 3000;

app.use(express.json());

// Main Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API Perpustakaan & Peminjaman Buku Berjalan' });
});

// Swagger UI Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Routing Resource
app.use('/books', booksRouter);
app.use('/members', membersRouter);
app.use('/loans', loansRouter);

// Global Error Handling Middleware (Wajib ditaruh paling bawah)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Dokumentasi Swagger dapat diakses di http://localhost:${PORT}/docs`);
});