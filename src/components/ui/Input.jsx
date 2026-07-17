import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({ className, type, label, error, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-brand-light/80">{label}</label>}
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-white/10 bg-brand-dark px-3 py-2 text-sm text-white transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-brand-light/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
})
Input.displayName = "Input"

export const Textarea = React.forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-brand-light/80">{label}</label>}
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border border-white/10 bg-brand-dark px-3 py-2 text-sm text-white transition-colors",
          "placeholder:text-brand-light/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
})
Textarea.displayName = "Textarea"
