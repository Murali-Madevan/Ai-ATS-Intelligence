import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Download, Trash2, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/context/AppContext'
import type { ScanRecord } from '@/types'

const HISTORY_KEY = 'resonance_scan_history'

function loadHistory(): ScanRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveHistory(scans: ScanRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(scans))
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function scoreBadge(score: number) {
  if (score >= 85) return 'success' as const
  if (score >= 70) return 'warning' as const
  return 'danger' as const
}

function downloadScanResult(scan: ScanRecord) {
  const content = `Scan Result
Date: ${scan.date}
Role: ${scan.role}
Company: ${scan.company}
Score: ${scan.score}/100
`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `scan-${(scan.role || 'unknown').replace(/\s+/g, '-').toLowerCase()}-${scan.date}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ScanHistory() {
  const navigate = useNavigate()
  const { analysisResult, resetAll } = useApp()
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    setScans(loadHistory())
  }, [])

  useEffect(() => {
    if (analysisResult) {
      const record: ScanRecord = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-CA'),
        role: analysisResult.candidate.role,
        company: analysisResult.candidate.company,
        score: analysisResult.overallScore,
      }
      setScans(prev => {
        const updated = [record, ...prev.filter(s => s.id !== record.id)].slice(0, 50)
        saveHistory(updated)
        return updated
      })
    }
  }, [analysisResult])

  function handleDelete(id: string) {
    setDeleting(id)
    setTimeout(() => {
      setScans((prev) => {
        const updated = prev.filter((s) => s.id !== id)
        saveHistory(updated)
        return updated
      })
      setDeleting(null)
    }, 300)
  }

  function handleNewScan() {
    resetAll()
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Scan History</CardTitle>
          <Button size="sm" onClick={handleNewScan}>
            <ScanLine className="h-4 w-4" />
            New Scan
          </Button>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                <ScanLine className="h-6 w-6 text-text-secondary" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-text">No scans yet</h3>
              <p className="mt-1 text-sm text-text-secondary">Run your first resume scan to see results here.</p>
              <Button className="mt-4" onClick={handleNewScan}>
                <ScanLine className="h-4 w-4" />
                Start a Scan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={container} initial="hidden" animate="show">
                  {scans.map((scan) => (
                    <motion.tr
                      key={scan.id}
                      variants={item}
                      className={`border-b border-border transition-colors hover:bg-surface ${deleting === scan.id ? 'opacity-0 scale-y-75' : ''}`}
                      style={{ transition: 'opacity 0.3s, transform 0.3s' }}
                    >
                      <td className="px-4 py-3 text-text">{scan.date}</td>
                      <td className="px-4 py-3 font-medium text-text">{scan.role}</td>
                      <td className="px-4 py-3 text-text-secondary">{scan.company}</td>
                      <td className="px-4 py-3">
                        <Badge variant={scoreBadge(scan.score)}>
                          {scan.score}/100
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate('/dashboard')}
                            aria-label="View scan details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => downloadScanResult(scan)}
                            aria-label="Download scan result"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-danger hover:text-danger"
                            onClick={() => handleDelete(scan.id)}
                            aria-label="Delete scan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
