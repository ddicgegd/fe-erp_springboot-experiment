import React from 'react';

const LoadingSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
    style={{ display: 'inline-block' }}
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.25" />
    <path d="M12 2 A10 10 0 0 1 22 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default LoadingSpinner;
