import { cn } from '../../lib/utils.js'

/**
 * Button component - handles primary, secondary, and ghost variants
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const baseStyles = 'font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-amber_light to-amber_dark text-black hover:from-orange hover:to-orange',
    secondary: 'bg-gradient-to-r from-amber_light to-amber_dark text-black hover:from-orange hover:to-orange',
    ghost: 'border border-button-ghost-border text-text-lighter bg-button-ghost-bg hover:border-[#4a4a4a]',
    run: 'border border-run-button-border text-run-button-text bg-run-button-bg hover:border-[#ffaa4d]',
  }

  const sizes = {
    sm: 'px-3 py-[7px] text-xs',
    md: 'px-3.5 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        'rounded-sm-radius',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Card component - wrapper for card containers
 */
export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'border border-analyze-border rounded-md-radius bg-analyze-bg hover:bg-[rgba(16,22,31,0.95)] transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Badge component - for status labels and tags
 */
export function Badge({ variant = 'default', className = '', children, ...props }) {
  const variants = {
    default: 'border border-[#788ca8] rounded-badge px-[7px] py-[3px] text-badge font-bold text-[#e6edf8]',
    success: 'border border-green-700 rounded-badge px-[7px] py-[3px] text-badge font-bold text-green-200',
    warning: 'border border-yellow-700 rounded-badge px-[7px] py-[3px] text-badge font-bold text-yellow-200',
  }

  return (
    <span className={cn(variants[variant], className)} {...props}>
      {children}
    </span>
  )
}

/**
 * CardHeader component
 */
export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={cn('p-4 border-b border-[#38485e]', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * CardContent component
 */
export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * CardTitle component
 */
export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={cn('text-lg font-bold text-text-lighter', className)} {...props}>
      {children}
    </h3>
  )
}

/**
 * Input component - for text, search, etc.
 */
export function Input({ type = 'text', disabled = false, className = '', ...props }) {
  return (
    <input
      type={type}
      disabled={disabled}
      className={cn(
        'w-full h-11 border border-input-border rounded-sm-radius bg-input-bg text-input-text text-base px-3.5 py-2',
        'placeholder:text-input-placeholder',
        'focus:outline-none focus:border-input-border-focus focus:shadow-input-focus',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  )
}
