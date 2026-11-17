import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, bookTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Confirm Deletion</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            Are you sure you want to remove <strong>"{bookTitle}"</strong> from the shared catalog?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            This action cannot be undone. The record will be permanently deleted from MongoDB.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={loading}
            style={{ gap: '0.4rem' }}
          >
            <Trash2 size={16} />
            <span>{loading ? 'Deleting...' : 'Delete Book'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

