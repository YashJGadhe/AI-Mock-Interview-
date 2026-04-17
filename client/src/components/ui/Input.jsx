import React, { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const inputClasses = [
    styles.input,
    error ? styles.hasError : '',
    icon ? (iconPosition === 'left' ? styles.hasIconLeft : styles.hasIconRight) : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && iconPosition === 'left' && (
          <span className={`${styles.icon} ${styles.iconLeft}`}>{icon}</span>
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className={`${styles.icon} ${styles.iconRight}`}>{icon}</span>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
