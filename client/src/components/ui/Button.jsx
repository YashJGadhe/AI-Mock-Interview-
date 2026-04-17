/**
 * Button Component
 * Reusable button with variants, sizes, and loading state
 */

import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...rest
}) => {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span>Loading…</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={styles.icon}>{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={styles.icon}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
