import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all duration-200
          ${error ? 'border-danger focus:ring-danger/50 focus:border-danger' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all duration-200 resize-y min-h-[120px]
          ${error ? 'border-danger focus:ring-danger/50 focus:border-danger' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
