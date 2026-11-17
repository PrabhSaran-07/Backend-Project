const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/books - Public. Return a filtered page of books.
router.get('/', bookController.getBooks);

// POST /api/books - Token required. Create a book.
router.post('/', authMiddleware, bookController.createBook);

// PUT /api/books/:id - Token required. Update a book by its ID.
router.put('/:id', authMiddleware, bookController.updateBook);

// DELETE /api/books/:id - Token required. Delete a book by its ID.
router.delete('/:id', authMiddleware, bookController.deleteBook);

module.exports = router;

