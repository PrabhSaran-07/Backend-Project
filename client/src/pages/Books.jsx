import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import BookModal from '../components/BookModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch books matching current page & search
  const fetchBooks = useCallback(async (targetPage = page, query = searchTerm) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/books', {
        params: {
          page: targetPage,
          limit: 5,
          search: query.trim()
        }
      });

      if (response.data.success) {
        setBooks(response.data.data || []);
        setPage(response.data.page || 1);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
      setError(err.response?.data?.message || 'Failed to load catalog. Ensure the API server is running.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  // useEffect watches the search term and page number
  useEffect(() => {
    fetchBooks(page, searchTerm);
  }, [page, searchTerm, fetchBooks]);

  // Typing updates React search state and resets page to 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Add Book handler: reloads page 1
  const handleCreateBook = async (bookData) => {
    await api.post('/books', bookData);
    if (page === 1) {
      fetchBooks(1, searchTerm);
    } else {
      setPage(1);
    }
  };

  // Edit Book handler: saves selected record
  const handleUpdateBook = async (bookData) => {
    if (!selectedBook) return;
    await api.put(`/books/${selectedBook._id}`, bookData);
    fetchBooks(page, searchTerm);
  };

  // Delete Book handler
  const handleDeleteBook = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/books/${deleteTarget._id}`);
      setDeleteTarget(null);
      // If we deleted the only item on a page > 1, go back one page
      if (books.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchBooks(page, searchTerm);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="books-page">
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Book Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Browse, search by title or author, correct publication years, and manage the collection.
          </p>
        </div>

        <button
          id="tour-add-btn"
          onClick={() => {
            setSelectedBook(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Book</span>
        </button>
      </div>

      {/* Search and stats bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Showing <strong>{books.length}</strong> of <strong>{totalItems}</strong> {totalItems === 1 ? 'book' : 'books'}</span>
          {searchTerm && (
            <span style={{ fontStyle: 'italic' }}>for "{searchTerm}"</span>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => fetchBooks(page, searchTerm)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'inherit', fontWeight: '600' }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#4f46e5',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ fontWeight: '500' }}>Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              background: 'var(--bg-surface-secondary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--text-dim)'
            }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              No books found
            </h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 1.25rem' }}>
              {searchTerm
                ? `No books match the search term "${searchTerm}". Try another keyword or clear the search.`
                : 'The catalog is currently empty. Be the first to add a book!'}
            </p>
            {searchTerm ? (
              <button onClick={() => setSearchTerm('')} className="btn btn-outline btn-sm">
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedBook(null);
                  setIsModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
              >
                Add Your First Book
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="catalog-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Title</th>
                  <th style={{ width: '30%' }}>Author</th>
                  <th style={{ width: '15%' }}>Published</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <div className="book-title">{book.title}</div>
                    </td>
                    <td>
                      <div className="book-author">{book.author}</div>
                    </td>
                    <td>
                      <span className="year-badge">{book.year}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setIsModalOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Correct publication year / details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(book)}
                          className="btn btn-danger-ghost btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Remove from catalog"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {!loading && totalPages > 0 && (
          <div className="pagination-container">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="page-btn"
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="page-btn"
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Book Add / Edit Modal */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBook(null);
        }}
        onSubmit={selectedBook ? handleUpdateBook : handleCreateBook}
        initialData={selectedBook}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBook}
        bookTitle={deleteTarget?.title}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Books;

