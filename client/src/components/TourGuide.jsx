import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const TOUR_STORAGE_KEY = 'mern_catalog_tour_completed';

const TOUR_STEPS = [
  {
    title: 'Welcome to MERN Book Catalog',
    body: 'This full-stack application connects React + Vite with an Express API and MongoDB database to manage a collaborative library.',
    selector: null
  },
  {
    title: '1. Fast Filter & Search',
    body: 'Type an author or book title in the search bar. React updates search state and automatically resets to page 1 while querying the API.',
    selector: '.search-wrapper'
  },
  {
    title: '2. Add to Shared Catalog',
    body: 'Click "Add Book" to create a new record. Controlled form inputs capture the title, author, and publication year, then reload page 1.',
    selector: '#tour-add-btn'
  },
  {
    title: '3. Record Operations',
    body: 'Signed-in users can edit publication years or delete records. Deleting prompts for confirmation to avoid accidental removals.',
    selector: '.catalog-table'
  },
  {
    title: '4. Dynamic 5-Item Pagination',
    body: 'The Express API computes total pages and counts matching documents in parallel, returning 5 records per page with active filter retention.',
    selector: '.pagination-container'
  }
];

const TourGuide = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    onClose();
  };

  return (
    <div className="tour-overlay">
      <div className="tour-card">
        <div className="tour-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span className="tour-step-badge">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={handleComplete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            title="Close walkthrough"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="tour-title">{step.title}</h3>
        <p className="tour-body">{step.body}</p>

        <div className="tour-footer">
          <button
            onClick={handleComplete}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          >
            Skip
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isFirst && (
              <button onClick={handlePrev} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                <ChevronLeft size={15} />
                <span>Back</span>
              </button>
            )}

            <button onClick={handleNext} className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
              <span>{isLast ? 'Got it!' : 'Next'}</span>
              {isLast ? <Check size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourGuide;

