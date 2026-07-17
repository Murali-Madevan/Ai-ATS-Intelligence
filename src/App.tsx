import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from '@/hooks/useTheme'
import { AppProvider } from '@/context/AppContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AppLayout from '@/components/layout/AppLayout'
import { Loader2 } from 'lucide-react'

const Home = lazy(() => import('@/pages/Home'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ATSScore = lazy(() => import('@/pages/ATSScore'))
const KeywordMatch = lazy(() => import('@/pages/KeywordMatch'))
const SkillGap = lazy(() => import('@/pages/SkillGap'))
const ResumeOptimizer = lazy(() => import('@/pages/ResumeOptimizer'))
const CareerCoach = lazy(() => import('@/pages/CareerCoach'))
const CoverLetter = lazy(() => import('@/pages/CoverLetter'))
const ScanHistory = lazy(() => import('@/pages/ScanHistory'))
const Settings = lazy(() => import('@/pages/Settings'))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    </div>
  )
}

function WrappedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<WrappedRoute><Home /></WrappedRoute>} />
              <Route element={<AppLayout />}>
                <Route path="dashboard" element={<WrappedRoute><Dashboard /></WrappedRoute>} />
                <Route path="report" element={<WrappedRoute><ATSScore /></WrappedRoute>} />
                <Route path="ats-score" element={<WrappedRoute><ATSScore /></WrappedRoute>} />
                <Route path="keyword-match" element={<WrappedRoute><KeywordMatch /></WrappedRoute>} />
                <Route path="skill-gap" element={<WrappedRoute><SkillGap /></WrappedRoute>} />
                <Route path="optimizer" element={<WrappedRoute><ResumeOptimizer /></WrappedRoute>} />
                <Route path="coach" element={<WrappedRoute><CareerCoach /></WrappedRoute>} />
                <Route path="resume" element={<WrappedRoute><ResumeOptimizer /></WrappedRoute>} />
                <Route path="cover-letter" element={<WrappedRoute><CoverLetter /></WrappedRoute>} />
                <Route path="history" element={<WrappedRoute><ScanHistory /></WrappedRoute>} />
                <Route path="settings" element={<WrappedRoute><Settings /></WrappedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export { AppProvider }
