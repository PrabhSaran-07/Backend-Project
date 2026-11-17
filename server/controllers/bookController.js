const Book = require('../models/Book');

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// GET /api/books
// Public. Return a filtered page of books.
exports.getBooks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
    const searchTerm = req.query.search ? req.query.search.trim() : '';

    let filter = {};
    if (searchTerm) {
      const regex = new RegExp(escapeRegex(searchTerm), 'i');
      filter = {
        $or: [{ title: regex }, { author: regex }]
      };
    }

    const skip = (page - 1) * limit;

    // Two queries run in parallel
    const [books, totalItems] = await Promise.all([
      Book.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Book.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      success: true,
      data: books,
      page,
      limit,
      totalItems,
      totalPages
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve books.',
      error: error.message
    });
  }
};

// POST /api/books
// Token required. Create a book.
exports.createBook = async (req, res) => {
  try {
    const { title, author, year } = req.body;

    if (!title || !author || year === undefined || year === null || year === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, author, and publication year.'
      });
    }

    const numericYear = parseInt(year, 10);
    if (isNaN(numericYear)) {
      return res.status(400).json({
        success: false,
        message: 'Publication year must be a valid number.'
      });
    }

    const newBook = await Book.create({
      title: title.trim(),
      author: author.trim(),
      year: numericYear,
      createdBy: req.user ? req.user.id : null
    });

    return res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      data: newBook
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create book.',
      error: error.message
    });
  }
};

// PUT /api/books/:id
// Token required. Update a book by its ID.
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, year } = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (year !== undefined && year !== null && year !== '') {
      const numericYear = parseInt(year, 10);
      if (isNaN(numericYear)) {
        return res.status(400).json({
          success: false,
          message: 'Publication year must be a valid number.'
        });
      }
      book.year = numericYear;
    }

    const updatedBook = await book.save();

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      data: updatedBook
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update book.',
      error: error.message
    });
  }
};

// DELETE /api/books/:id
// Token required. Delete a book by its ID.
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    await Book.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete book.',
      error: error.message
    });
  }
};

