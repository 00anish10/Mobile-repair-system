import React from 'react';

const sizes = {
  small: '64px',
  medium: '128px',
  large: '256px',
};

const variants = {
  shimmer: 'bg-slate-100 animate-shimmer',
  bg: 'bg-slate-100',
};

export const SkeletonLoader: React.FC<{
  width?: string | number;
  height?: string | number;
  variant?: 'shimmer' | 'bg';
  size?: 'small' | 'medium' | 'large';
}> = ({
  width = '100%',
  height = '20',
  variant = 'shimmer',
  size = 'medium',
}) => {
  const sizeValue = sizes[size];
  const widthStyle = typeof width === 'number' ? `${width}px` : `${width}%`;
  const heightStyle = typeof height === 'number' ? `${height}px` : `${height}px`;

  return (
    <div
      className={`animate-shimmer rounded-xl ${variant} w-full ${widthStyle} h-${sizeValue}`}
    />
  );
};

export const SkeletonTitle: React.FC<{
  size?: 'small' | 'medium' | 'large';
  className?: string;
}> = ({
  size = 'medium',
  className,
}) => {
  const sizes = { small: '12px', medium: '14px', large: '18px' };
  return (
    <div
      className={`rounded-bxl ${sizes[size]} h-[${sizes[size]}] animate-shimmer ${className || ''}`}
    />
  );
};

export const SkeletonParagraph: React.FC<{
  lines?: number;
  className?: string;
}> = ({
  lines = 2,
  className,
}) => {
  return (
    <div
      className={`h-[calc(${lines} * 1rem+8px)] rounded-md animate-shimmer ${className || ''}`}
    />
  );
};