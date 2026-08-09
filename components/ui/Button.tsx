import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}) => {
  let baseStyles =
    'inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium transition-colors duration-150 rounded disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

  let variantStyles = '';

  if (variant === 'primary') {
    variantStyles = 'bg-accent text-white hover:bg-accent-dark active:bg-accent-dark';
  } else if (variant === 'secondary') {
    variantStyles =
      'bg-surface-raised border border-borderCustom text-ink hover:bg-surface active:bg-surface';
  } else if (variant === 'ghost') {
    variantStyles = 'text-ink-muted hover:text-ink hover:bg-surface/50';
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
