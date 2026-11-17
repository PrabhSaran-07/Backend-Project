import React, { useState, useEffect } from 'react';
import { X, BookPlus, Edit3, AlertCircle } from 'lucide-react';

const BookModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(initialData && initialData._id);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setAuthor(initialData.author || '');
        setYear(initialData.year || '');
      } else {
        setTitle('');
        setAuthor('');
        setYear(new Date().getFullYear().toString());
      }
      setError('');
      setSubmitting(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !year) {
      setError('Please fill in title, author, and publication year.');
      return;
    }

    const numericYear = parseInt(year, 10);
    if (isNaN(numericYear) || numericYear < 0 || numericYear > 2100) {
      setError('Please provide a valid publication year between 0 and 2100.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        year: numericYear
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEdit ? <Edit3 size={18} color="var(--primary)" /> : <BookPlus size={18} color="var(--primary)" />}
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
              {isEdit ? 'Correct Publication Year / Book' : 'Add New Book'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Book Title *
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="e.g. Clean Code"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="author">
                Author *
              </label>
              <input
                id="author"
                type="text"
                className="form-input"
                placeholder="e.g. Robert C. Martin"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="year">
                Publication Year *
              </label>
              <input
                id="year"
                type="number"
                className="form-input"
                placeholder="e.g. 2008"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;

