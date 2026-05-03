import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span style={{ color: 'var(--primary-color)' }}>R</span>entGrid
      </Link>
      
      <div className="navbar-nav">
        {user && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <User size={18} />
              <span>{user.username}</span>
              <span className="badge" style={{ backgroundColor: '#334155', color: '#f8fafc', marginLeft: '0.5rem' }}>
                {user.role}
              </span>
            </div>
            <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }}>
              <LogOut size={20} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
