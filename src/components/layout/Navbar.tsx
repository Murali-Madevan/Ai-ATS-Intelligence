import { useLocation, useNavigate } from 'react-router-dom'
import { ScanLine, History, Sun, Moon, User, Settings as SettingsIcon, LogOut, Menu, X, LayoutDashboard, BarChart3, Brain, FileText, Sparkles, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report', label: 'ATS Score', icon: BarChart3 },
  { to: '/skill-gap', label: 'Skill Gap', icon: Brain },
  { to: '/resume', label: 'Optimizer', icon: Sparkles },
]

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-navbar/80 px-4 backdrop-blur-xl shadow-xs sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        <Logo />
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => {
          const active = location.pathname === link.to
          return (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="sm:w-auto sm:px-3"
          aria-label="Scan History"
          onClick={() => navigate('/history')}
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">History</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="relative"
        >
          <div className="relative h-4 w-4">
            <Sun className={cn('absolute inset-0 h-4 w-4 transition-all duration-300', theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90')} />
            <Moon className={cn('absolute inset-0 h-4 w-4 transition-all duration-300', theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90')} />
          </div>
        </Button>

        <DropdownMenu
          trigger={
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:opacity-90 active:scale-95"
              aria-label="User menu"
            >
              AK
            </button>
          }
        >
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <SettingsIcon className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenu>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-border bg-card p-4 shadow-lg md:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.to
              return (
                <button
                  key={link.to}
                  onClick={() => { navigate(link.to); setMobileOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-surface hover:text-text'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
