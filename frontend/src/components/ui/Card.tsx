import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md ${
        hoverEffect ? 'hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
