import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Brain, FileText, Sparkles, ScanLine, Settings, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/report', label: 'ATS Score', icon: BarChart3 },
  { to: '/keyword-match', label: 'Keywords', icon: FileText },
  { to: '/skill-gap', label: 'Skill Gap', icon: Brain },
  { to: '/resume', label: 'Optimizer', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { resetAll } = useApp()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex flex-col gap-1 p-4 pt-6">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-text-secondary hover:bg-surface hover:text-text'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto p-4 flex flex-col gap-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Button
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => { resetAll(); navigate('/'); }}
          >
            <Home className="h-4 w-4" />
            New Scan
          </Button>
        </motion.div>
      </div>
    </aside>
  )
}

export default Sidebar
