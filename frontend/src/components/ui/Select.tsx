import { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="block text-white mb-2">{label}</label>}
      <select
        className={`w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-purple-400 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
