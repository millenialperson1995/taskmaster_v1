import React from 'react';

export const Select = ({ className = '', children, ...props }) => {
  const baseClasses = "p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-full";
  return (
    <select className={`${baseClasses} ${className}`} {...props}>
      {children}
    </select>
  );
};