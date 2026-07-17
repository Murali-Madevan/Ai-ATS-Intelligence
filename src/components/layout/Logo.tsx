import { Badge } from '@/components/ui/badge'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B5BD6" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="29" height="29" rx="9" fill="url(#logo-grad)" />
        <path d="M10 16 L14 20 L22 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
        <circle cx="22" cy="22" r="3" fill="white" opacity="0.3" />
      </svg>
      <div className="flex items-center gap-1.5 leading-none">
        <span className="text-lg font-bold tracking-tight text-text">Resonance</span>
        <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide">
          Beta
        </Badge>
      </div>
    </div>
  )
}

export default Logo
