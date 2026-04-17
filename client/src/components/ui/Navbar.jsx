import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/interview/setup', label: 'New Interview', icon: '🎯' },
    { to: '/history', label: 'History', icon: '📋' },
    { to: '/resources', label: 'Resources', icon: '📚' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/dashboard" className={styles.logo}>
          <span className={styles.logoIcon}>🎯</span>
          <span className={styles.logoText}>
            AI <span className={styles.logoBold}>Interview</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        {isAuthenticated && (
          <div className={styles.links}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className={styles.right}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button
                className={styles.avatar}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                ) : (
                  <span className={styles.avatarInitial}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <>
                  <div className={styles.overlay} onClick={() => setDropdownOpen(false)} />
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownName}>{user?.name}</span>
                      <span className={styles.dropdownEmail}>{user?.email}</span>
                    </div>
                    <Link
                      to="/profile"
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      👤 Profile
                    </Link>
                    <button
                      className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginBtn}>Login</Link>
              <Link to="/signup" className={styles.signupBtn}>Sign up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {isAuthenticated && (
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={menuOpen ? styles.barOpen : styles.bar} />
              <span className={menuOpen ? styles.barOpen : styles.bar} style={{ opacity: menuOpen ? 0 : 1 }} />
              <span className={menuOpen ? styles.barOpen : styles.bar} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && isAuthenticated && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.icon}</span> {link.label}
            </NavLink>
          ))}
          <div className={styles.mobileDivider} />
          <button className={styles.mobileLogout} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
