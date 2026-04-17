import React from 'react';
import styles from './Card.module.css';

const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  bordered = false,
  ...rest
}) => {
  const classes = [
    styles.card,
    styles[`pad-${padding}`],
    hover ? styles.hover : '',
    bordered ? styles.bordered : '',
    onClick ? styles.clickable : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...rest}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`${styles.header} ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`${styles.title} ${className}`}>{children}</h3>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`${styles.body} ${className}`}>{children}</div>
);

export default Card;
