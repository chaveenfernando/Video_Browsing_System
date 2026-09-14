import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-slate-900/80 border ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20'
        } rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
    </div>
  );
};
