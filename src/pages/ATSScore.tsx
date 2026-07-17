import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ProgressBar'
import { Gauge } from '@/components/Gauge'
import { useCountUp } from '@/hooks/useCountUp'
import { useApp } from '@/context/AppContext'
import { AlertCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ATSScore() {
  const { analysisResult } = useApp()
  const navigate = useNavigate()
  const data = analysisResult
  const { value, ref } = useCountUp(data?.overallScore ?? 0)

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
          <h3 className="mb-2 text-lg font-medium">No Analysis Data</h3>
          <p className="mb-6 max-w-sm text-sm text-text-secondary">
            Analyze a resume first to see your ATS score.
          </p>
          <Button onClick={() => navigate('/')}>
            <Upload className="mr-2 h-4 w-4" />
            Analyze Resume
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Gauge value={data.overallScore} size={260} label="Overall ATS Score" />
            <div ref={ref} className="mt-4 text-5xl font-bold text-text">
              {value}
              <span className="text-2xl text-text-secondary">/100</span>
            </div>
            <p className="mt-2 max-w-md text-center text-sm text-text-secondary">
              {data.summary}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {data.platformScores.map((platform) => (
          <motion.div key={platform.name} variants={item}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{platform.name}</CardTitle>
                <Badge variant={platform.pass ? 'success' : 'danger'}>
                  {platform.pass ? 'Pass' : 'Fail'}
                </Badge>
              </CardHeader>
              <CardContent>
                <ProgressBar label={`${platform.score}/100`} value={platform.score} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
