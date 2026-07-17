import { useState, useRef, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onClear: () => void
  fileName: string | null
  accept?: string
  maxSizeMB?: number
  label?: string
}

export function FileUpload({ onFileSelect, onClear, fileName, accept = '.pdf,.doc,.docx,.txt', maxSizeMB = 5, label = 'Upload File' }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateAndSelect(file: File) {
    setError(null)
    setSuccess(false)

    const allowedTypes = accept.split(',').map(t => t.trim().toLowerCase())
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedTypes.includes(ext) && !allowedTypes.includes('.*')) {
      setError(`Invalid file type. Accepted: ${accept}`)
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB}MB limit`)
      return
    }

    onFileSelect(file)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSelect(file)
    e.target.value = ''
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSelect(file)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleClear() {
    setError(null)
    setSuccess(false)
    onClear()
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-label={label}
      />

      {!fileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200 ${
            dragOver
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border bg-card hover:border-primary/50 hover:bg-surface'
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${dragOver ? 'bg-primary/15' : 'bg-surface'}`}>
            <Upload className={`h-5 w-5 ${dragOver ? 'text-primary' : 'text-text-secondary'}`} />
          </div>
          <p className="mt-3 text-sm font-medium text-text">
            {dragOver ? 'Drop file here' : `Drag & drop or ${label.toLowerCase()}`}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {accept.replace(/,/g, ', ')} — Max {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">{fileName}</p>
          </div>
          <button
            onClick={handleClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-danger transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
          <span className="text-sm text-danger">{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2.5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          <span className="text-sm text-success">File uploaded successfully</span>
        </motion.div>
      )}
    </div>
  )
}
