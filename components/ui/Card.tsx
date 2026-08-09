import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'raised';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const bgClass = variant === 'raised' ? 'bg-surface-raised' : 'bg-surface';

  return (
    <div
      className={`${bgClass} border border-borderCustom rounded-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
};
