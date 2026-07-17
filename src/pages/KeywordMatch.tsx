import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KeywordChip } from '@/components/KeywordChip'
import { useApp } from '@/context/AppContext'
import { AlertCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function KeywordMatch() {
  const { analysisResult } = useApp()
  const navigate = useNavigate()
  const data = analysisResult

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
          <h3 className="mb-2 text-lg font-medium">No Analysis Data</h3>
          <p className="mb-6 max-w-sm text-sm text-text-secondary">
            Analyze a resume first to see keyword matching.
          </p>
          <Button onClick={() => navigate('/')}>
            <Upload className="mr-2 h-4 w-4" />
            Analyze Resume
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { keywordMatch } = data

  return (
    <div className="space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Matched Keywords</CardTitle>
              <CardDescription>Keywords found in your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywordMatch.matched.map((kw) => (
                  <KeywordChip key={kw} label={kw} variant="matched" />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Missing Keywords</CardTitle>
              <CardDescription>Keywords absent from your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywordMatch.missing.map((kw) => (
                  <KeywordChip key={kw} label={kw} variant="missing" />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Keyword Density</CardTitle>
            <CardDescription>Frequency of key terms across your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={keywordMatch.density} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="keyword"
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--color-border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--color-surface)' }}
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 12,
                      color: 'var(--color-text)',
                    }}
                  />
                  <Bar dataKey="density" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Priority Keywords</CardTitle>
            <CardDescription>High-impact terms to add first</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywordMatch.priority.map((p) => (
                <KeywordChip
                  key={p.keyword}
                  label={p.keyword}
                  variant="priority"
                  priority={p.priority}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
