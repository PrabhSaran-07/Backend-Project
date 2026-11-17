import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, LogOut, LogIn, UserPlus, HelpCircle } from 'lucide-react';

const Navbar = ({ onRestartTour }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/books" className="nav-brand">
          <div className="nav-brand-icon">
            <BookOpen size={20} />
          </div>
          <span>MERN Book Catalog</span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/books"
            className={`nav-link ${location.pathname === '/books' || location.pathname === '/' ? 'active' : ''}`}
          >
            Catalog
          </Link>

          {isAuthenticated ? (
            <>
              {onRestartTour && (
                <button
                  onClick={onRestartTour}
                  className="btn btn-outline btn-sm"
                  title="Take product walkthrough"
                  style={{ gap: '0.35rem' }}
                >
                  <HelpCircle size={15} />
                  <span>Tour</span>
                </button>
              )}
              <div className="user-badge" title={user?.email}>
                <User size={15} color="var(--primary)" />
                <span>{user?.username || 'User'}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

