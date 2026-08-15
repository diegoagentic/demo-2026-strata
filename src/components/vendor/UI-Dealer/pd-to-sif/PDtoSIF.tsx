/**
 * SOURCE: UI-Dealer/src/features/pd-to-sif/PDtoSIF.tsx
 * LIFTED: 2026-08-14 · via F74 Phase 1B.PRE
 * Do not edit in place · re-sync from source when prod evolves.
 * Adaptations belong in sibling wrappers/*.tsx files.
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import {
  FileText, Upload, X, Check, AlertCircle, AlertTriangle,
  ChevronRight, CheckCircle2, Sparkles, Pencil, ArrowRight, Download,
} from 'lucide-react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import {
  Button,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  SlideOver, SlideOverHeader, SlideOverTitle, SlideOverBody,
  Input,
} from 'strata-design-system'

const CTA = 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 rounded-full h-11 px-8 text-sm font-semibold shadow-sm'
const BTN_OUTLINE = 'bg-transparent border border-border text-foreground hover:bg-muted disabled:opacity-40'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'processing' | 'review' | 'done'
type FileStatus = 'pending' | 'processing' | 'needs-review' | 'completing' | 'ready' | 'error'

interface PDField {
  id: string
  label: string
  section: string
  extracted: string    // what was read from PDF — empty means not found
  suggestion: string   // AI-corrected value
  confidence: number
  userValue: string
}

interface PDDocument {
  id: string
  name: string
  sizeLabel: string
  status: FileStatus
  progress: number
  overallConfidence: number
  fields: PDField[]
  needsReview: boolean
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const FIELD_TEMPLATES: {
  label: string
  section: string
  suggestion: (n: number) => string
  wrongExtracted?: (n: number) => string
}[] = [
  { section: 'Header',   label: 'PD Number',
    suggestion:     n => `PD-2024-${1000 + n * 37}`,
    wrongExtracted: n => `PD2024-${1000 + n * 37}` },
  { section: 'Header',   label: 'Reference PO',
    suggestion:     n => `PO-8821-${String.fromCharCode(65 + n)}`,
    wrongExtracted: n => `PO-882l-${String.fromCharCode(65 + n)}` },
  { section: 'Header',   label: 'Ship Date',
    suggestion:     _  => '2024-11-15',
    wrongExtracted: _  => '2024-10-28' },
  { section: 'Vendor',   label: 'Vendor Name',
    suggestion:     _  => 'Almo Corporation',
    wrongExtracted: _  => 'ALMO CORP.' },
  { section: 'Vendor',   label: 'Vendor Address',
    suggestion:     _  => '2709 Commerce Way, Philadelphia PA 19154',
    wrongExtracted: _  => '2709 Commerce Way Philadelphia' },
  { section: 'Vendor',   label: 'Contact Email',
    suggestion:     _  => 'orders@almocorp.com',
    wrongExtracted: _  => 'orders@alm0corp.com' },
  { section: 'Shipping', label: 'Carrier',
    suggestion:     _  => 'FedEx Freight' },
  { section: 'Shipping', label: 'BOL Number',
    suggestion:     n => `BOL-${558843 + n}`,
    wrongExtracted: n => `BOL-${558841 + n}` },
  { section: 'Shipping', label: 'Total Weight',
    suggestion:     n => `${412 + n * 18} lbs`,
    wrongExtracted: n => `${408 + n * 18} lbs` },
]

// Scenarios: first two always need expert review; docs 2 & 4 are fully AI-resolved
const CONFIDENCE_MAP: number[][] = [
  [96, 97, 48, 71, 52, 90, 94, 91, 89],
  [95, 98, 44, 65, 49, 88, 92, 90, 87],
  [97, 98, 91, 88, 86, 92, 94, 93, 90],
  [96, 97, 62, 83, 79, 89, 93, 91, 88],
  [97, 99, 88, 90, 87, 91, 95, 93, 90],
]

function buildDocument(file: File, index: number): PDDocument {
  const confs = CONFIDENCE_MAP[index % CONFIDENCE_MAP.length]
  const overall = Math.round(confs.reduce((a, b) => a + b, 0) / confs.length)

  const fields: PDField[] = FIELD_TEMPLATES.map((tmpl, i) => {
    const conf = confs[i]
    const suggestion = tmpl.suggestion(index)
    // ≥85 → extracted correctly; 60–84 with wrongExtracted → value mismatch; else → not found
    const extracted = conf >= 85
      ? suggestion
      : conf >= 60 && tmpl.wrongExtracted
        ? tmpl.wrongExtracted(index)
        : ''
    return { id: `${index}-${i}`, label: tmpl.label, section: tmpl.section,
             extracted, suggestion, confidence: conf, userValue: suggestion }
  })

  return {
    id: `doc-${index}-${file.name}`,
    name: file.name,
    sizeLabel: `${(file.size / 1024).toFixed(0)} KB`,
    status: 'pending',
    progress: 0,
    overallConfidence: overall,
    fields,
    needsReview: fields.some(f => f.confidence < 85),
  }
}

function downloadSIF(docs: PDDocument[]) {
  const payload = docs
    .filter(d => d.status === 'ready')
    .map(doc => ({
      documentId: doc.id,
      documentName: doc.name,
      format: 'SIF',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      fields: Object.fromEntries(
        doc.fields.map(f => [f.label.replace(/\s+/g, '_').toLowerCase(), f.userValue])
      ),
    }))
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sif-export-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'upload',     label: 'Upload' },
    { key: 'processing', label: 'Processing' },
    { key: 'review',     label: 'Review' },
    { key: 'done',       label: 'Done' },
  ]
  const idx = steps.findIndex(s => s.key === step)
  return (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((s, i) => (
        <Fragment key={s.key}>
          <span className={i <= idx ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            {s.label}
          </span>
          {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        </Fragment>
      ))}
    </div>
  )
}

// ── Table chips ───────────────────────────────────────────────────────────────

function ExtractionChip({ doc }: { doc: PDDocument }) {
  if (doc.status === 'processing' || doc.status === 'completing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="w-3 h-3 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin" />
        {Math.round(doc.progress)}%
      </span>
    )
  }
  if (doc.status === 'error') {
    return <span className="inline-flex items-center gap-1 text-xs text-destructive"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>
  }
  return <span className="inline-flex items-center gap-1 text-xs text-foreground"><Check className="w-3.5 h-3.5" /> Extracted</span>
}

function IssueChip({ doc }: { doc: PDDocument }) {
  if (doc.status === 'pending' || doc.status === 'processing' || doc.status === 'error') {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  if (doc.status === 'needs-review') {
    const n = doc.fields.filter(f => f.confidence < 85).length
    return <span className="inline-flex items-center gap-1 text-xs text-destructive"><AlertCircle className="w-3.5 h-3.5" /> {n} field{n > 1 ? 's' : ''} to review</span>
  }
  if (doc.status === 'completing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="w-3 h-3 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin" />
        Completing…
      </span>
    )
  }
  // ready
  const hadIssues = doc.fields.some(f => f.confidence < 85)
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="w-3.5 h-3.5" />
      {hadIssues ? 'Expert reviewed' : 'AI resolved'}
    </span>
  )
}

// ── Discrepancy field card ─────────────────────────────────────────────────────

interface DiscrepancyFieldProps {
  field: PDField
  resolved: boolean
  onAccept: () => void
  onEdit: (val: string) => void
}

function DiscrepancyField({ field, resolved, onAccept, onEdit }: DiscrepancyFieldProps) {
  const [editing, setEditing] = useState(false)
  const isMissing = field.extracted === ''

  if (resolved) {
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-border/40">
        <Check className="w-4 h-4 text-foreground shrink-0" />
        <span className="text-xs text-muted-foreground w-28 shrink-0">{field.label}</span>
        <span className="text-sm text-foreground flex-1">{field.userValue}</span>
        <span className="text-[10px] text-muted-foreground">Confirmed</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3.5 space-y-2.5">
      {/* Label + type badge + confidence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMissing
            ? <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
            : <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
          }
          <span className="text-xs font-medium text-foreground">{field.label}</span>
          <span className={[
            'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
            isMissing
              ? 'bg-destructive/15 text-destructive'
              : 'bg-destructive/8 text-destructive',
          ].join(' ')}>
            {isMissing ? 'Field missing' : 'Value mismatch'}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">{field.confidence}%</span>
      </div>

      {/* Extracted → suggested */}
      <div className="flex items-start gap-2 text-xs">
        {field.extracted
          ? <span className="text-muted-foreground line-through leading-relaxed">{field.extracted}</span>
          : <span className="text-destructive italic leading-relaxed">Not found in document</span>
        }
        <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
        <div className="flex items-start gap-1 flex-1">
          <Sparkles className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
          <span className="font-medium text-foreground leading-relaxed">{field.suggestion}</span>
        </div>
      </div>

      {editing && (
        <Input
          value={field.userValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEdit(e.target.value)}
          className="text-sm h-8"
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Check className="w-3 h-3" /> Accept
        </button>
        <button
          onClick={() => setEditing(e => !e)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          <Pencil className="w-3 h-3" /> {editing ? 'Hide' : 'Edit'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface PageProps {
  onLogout: () => void
  onNavigateToWorkspace: () => void
  onNavigate: (page: string) => void
}

export default function PDtoSIF({ onLogout: _l, onNavigateToWorkspace: _w, onNavigate: _n }: PageProps) {
  const [step, setStep]               = useState<Step>('upload')
  const [files, setFiles]             = useState<File[]>([])
  const [docs, setDocs]               = useState<PDDocument[]>([])
  const [dragging, setDragging]       = useState(false)
  const [detailDoc, setDetailDoc]     = useState<PDDocument | null>(null)
  const [resolvedFields, setResolvedFields] = useState<Map<string, Set<string>>>(new Map())
  const [showSaved, setShowSaved]     = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File handling ──────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(f => f.type === 'application/pdf')
    setFiles(prev => [...prev, ...pdfs].slice(0, 5))
  }, [])

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index))

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  // ── Processing: stalls at overallConfidence% for docs needing review ───────

  useEffect(() => {
    if (step !== 'processing') return
    const intervals: ReturnType<typeof setInterval>[] = docs.map((_doc, i) =>
      setInterval(() => {
        setDocs(prev => {
          const next = [...prev]
          const d = { ...next[i] }
          if (d.status === 'pending') { d.status = 'processing'; d.progress = 0 }
          if (d.status !== 'processing') return prev
          const stallAt = d.needsReview ? d.overallConfidence : 100
          if (d.progress >= stallAt) {
            d.status = d.needsReview ? 'needs-review' : (d.overallConfidence < 40 ? 'error' : 'ready')
            d.progress = stallAt
          } else {
            d.progress = Math.min(d.progress + (i === 0 ? 4 : 2.5), stallAt)
          }
          next[i] = d
          return next
        })
      }, i === 0 ? 60 : 90 + i * 44)
    )
    return () => intervals.forEach(clearInterval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // ── Completing: animate from stall point → 100% after expert resolves ──────

  const completingKey = docs.filter(d => d.status === 'completing').map(d => d.id).join(',')

  useEffect(() => {
    if (!completingKey) return
    const indices = docs
      .map((d, i) => ({ d, i }))
      .filter(({ d }) => d.status === 'completing')
      .map(({ i }) => i)

    const intervals = indices.map(i =>
      setInterval(() => {
        setDocs(prev => {
          const next = [...prev]
          const d = { ...next[i] }
          if (d.status !== 'completing') return prev
          d.progress = Math.min(d.progress + 4, 100)
          if (d.progress >= 100) d.status = 'ready'
          next[i] = d
          return next
        })
      }, 50)
    )
    return () => intervals.forEach(clearInterval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completingKey])

  // ── Transition to review once all docs have terminal status ───────────────

  useEffect(() => {
    if (step !== 'processing') return
    if (docs.length > 0 && docs.every(d =>
      d.status === 'ready' || d.status === 'needs-review' || d.status === 'error'
    )) {
      const t = setTimeout(() => setStep('review'), 600)
      return () => clearTimeout(t)
    }
  }, [docs, step])

  const startProcessing = () => {
    setDocs(files.map((f, i) => buildDocument(f, i)))
    setResolvedFields(new Map())
    setStep('processing')
  }

  // ── Review actions ─────────────────────────────────────────────────────────

  const getResolved = (docId: string) => resolvedFields.get(docId) ?? new Set<string>()

  const acceptField = (docId: string, fieldId: string) => {
    setResolvedFields(prev => {
      const next = new Map(prev)
      const set = new Set(next.get(docId) ?? [])
      set.add(fieldId)
      next.set(docId, set)
      return next
    })
    setDetailDoc(prev =>
      prev?.id === docId ? { ...prev, fields: prev.fields.map(f => f.id === fieldId ? { ...f } : f) } : prev
    )
  }

  const editField = (docId: string, fieldId: string, value: string) => {
    setDetailDoc(prev =>
      prev?.id === docId ? { ...prev, fields: prev.fields.map(f => f.id === fieldId ? { ...f, userValue: value } : f) } : prev
    )
  }

  // Persists edits and triggers the completing animation
  const confirmReview = () => {
    if (!detailDoc) return
    setDocs(prev => prev.map(d =>
      d.id === detailDoc.id ? { ...detailDoc, status: 'completing', needsReview: false } : d
    ))
    setDetailDoc(null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const lowConf  = (doc: PDDocument) => doc.fields.filter(f => f.confidence < 85)
  const highConf = (doc: PDDocument) => doc.fields.filter(f => f.confidence >= 85)
  const allLowResolved = (doc: PDDocument) => lowConf(doc).every(f => getResolved(doc.id).has(f.id))

  const readyDocs    = docs.filter(d => d.status === 'ready')
  const pendingDocs  = docs.filter(d => d.status === 'needs-review' || d.status === 'completing')
  const canSave      = readyDocs.length > 0 && pendingDocs.length === 0
  const pendingCount = docs.filter(d => d.status === 'needs-review').length

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">PD to SIF</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Convert packing documents to Standard Industry Format</p>
          </div>
          <StepIndicator step={step} />
        </div>

        {/* ── Upload ──────────────────────────────────────────────────────── */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragEnter={e => { e.preventDefault(); setDragging(true) }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => files.length < 5 && fileInputRef.current?.click()}
              className={[
                'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 cursor-pointer transition-colors select-none',
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/40',
                files.length >= 5 ? 'cursor-not-allowed opacity-60' : '',
              ].join(' ')}
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop PDF files here or <span className="underline decoration-dotted">click to select</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Up to 5 files · PDF only</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden"
                onChange={e => e.target.files && addFiles(e.target.files)} />
            </div>

            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm text-foreground truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                    <button onClick={e => { e.stopPropagation(); removeFile(i) }}
                      className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`Remove ${file.name}`}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="primary" className={CTA} disabled={files.length === 0} onClick={startProcessing}>
                Convert to SIF
              </Button>
            </div>
          </div>
        )}

        {/* ── Processing ──────────────────────────────────────────────────── */}
        {step === 'processing' && (
          <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-4">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground truncate block">{doc.name}</span>
                  {doc.status === 'needs-review' && (
                    <span className="text-xs text-destructive">Expert review needed</span>
                  )}
                </div>
                <div className="w-44 flex items-center gap-3 shrink-0">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${doc.status === 'needs-review' ? 'bg-destructive/50' : 'bg-primary'}`}
                      style={{ width: `${doc.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
                    {Math.round(doc.progress)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Review ──────────────────────────────────────────────────────── */}
        {step === 'review' && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              {readyDocs.length} of {docs.length} document{docs.length !== 1 ? 's' : ''} ready.{' '}
              {pendingCount > 0
                ? <span className="text-destructive">{pendingCount} need{pendingCount === 1 ? 's' : ''} expert review.</span>
                : 'All ready to save.'
              }
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Extraction</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map(doc => (
                    <TableRow
                      key={doc.id}
                      className={doc.status !== 'pending' && doc.status !== 'completing' ? 'cursor-pointer' : ''}
                      onClick={() => {
                        if (doc.status !== 'pending' && doc.status !== 'completing') setDetailDoc(doc)
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate max-w-[200px]">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><ExtractionChip doc={doc} /></TableCell>
                      <TableCell><IssueChip doc={doc} /></TableCell>
                      <TableCell className="text-right">
                        {doc.status !== 'error' && doc.status !== 'completing' && (
                          <button
                            onClick={e => { e.stopPropagation(); setDetailDoc(doc) }}
                            className="text-xs text-muted-foreground hover:text-foreground underline decoration-dotted transition-colors"
                          >
                            {doc.status === 'needs-review' ? 'Review →' : 'View →'}
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => { setStep('upload'); setFiles([]); setDocs([]) }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Start over
              </button>
              <Button variant="primary" className={CTA} disabled={!canSave} onClick={() => setShowSaved(true)}>
                Save to System
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── SlideOver ─────────────────────────────────────────────────────── */}
      <SlideOver open={detailDoc !== null} onClose={() => setDetailDoc(null)}>
        <SlideOverHeader onClose={() => setDetailDoc(null)}>
          <SlideOverTitle className="truncate pr-4">{detailDoc?.name}</SlideOverTitle>
        </SlideOverHeader>
        <SlideOverBody className="py-0 flex flex-col h-full">
          {detailDoc && (() => {
            const low  = lowConf(detailDoc)
            const high = highConf(detailDoc)
            const resolved = getResolved(detailDoc.id)
            const needsAction = detailDoc.needsReview && detailDoc.status === 'needs-review'

            return (
              <>
                <div className="flex-1 overflow-y-auto">
                  {/* Confidence bar */}
                  <div className="px-6 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Extraction confidence</span>
                      <span className="text-xs font-medium text-foreground">{detailDoc.overallConfidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${detailDoc.overallConfidence >= 85 ? 'bg-primary' : 'bg-destructive/60'}`}
                        style={{ width: `${detailDoc.overallConfidence}%` }}
                      />
                    </div>
                    {needsAction && (
                      <div className="mt-4 flex items-start gap-3 p-3 bg-destructive/8 border border-destructive/20 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-destructive">Expert review required</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {low.length} field{low.length > 1 ? 's' : ''} need manual confirmation before saving.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Discrepancy fields */}
                  {needsAction && low.length > 0 && (
                    <div className="px-6 pt-5 pb-4 border-b border-border space-y-3">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        Needs Review · {resolved.size}/{low.length} resolved
                      </p>
                      {low.map(field => (
                        <DiscrepancyField
                          key={field.id}
                          field={{ ...field, userValue: detailDoc.fields.find(f => f.id === field.id)?.userValue ?? field.suggestion }}
                          resolved={resolved.has(field.id)}
                          onAccept={() => acceptField(detailDoc.id, field.id)}
                          onEdit={val => editField(detailDoc.id, field.id, val)}
                        />
                      ))}
                    </div>
                  )}

                  {/* AI-confirmed fields */}
                  <div className="px-6 pt-5 pb-6">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
                      AI Confirmed · {high.length} fields
                    </p>
                    <div className="divide-y divide-border/40">
                      {high.map(field => (
                        <div key={field.id} className="flex items-center gap-3 py-2.5">
                          <Check className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground w-28 shrink-0">{field.label}</span>
                          <span className="text-sm text-foreground flex-1 truncate">{field.suggestion}</span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
                            <Sparkles className="w-2.5 h-2.5" /> {field.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-card shrink-0">
                  {needsAction ? (
                    <Button
                      variant="primary"
                      className={`${CTA} w-full justify-center ${!allLowResolved(detailDoc) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      disabled={!allLowResolved(detailDoc)}
                      onClick={confirmReview}
                    >
                      Resolve Inconsistencies
                    </Button>
                  ) : (
                    <Button variant="outline" className={`${BTN_OUTLINE} w-full justify-center`}
                      onClick={() => setDetailDoc(null)}>
                      Close
                    </Button>
                  )}
                </div>
              </>
            )
          })()}
        </SlideOverBody>
      </SlideOver>

      {/* ── Success modal ─────────────────────────────────────────────────── */}
      <Transition appear show={showSaved} as={Fragment}>
        <Dialog onClose={() => {}} className="relative z-50">
          <TransitionChild as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-zinc-950/30 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <DialogPanel className="w-full max-w-sm rounded-2xl bg-card border border-border p-8 text-center shadow-lg">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-foreground" />
                  </div>
                </div>
                <h2 className="text-base font-semibold text-foreground mb-1">
                  {readyDocs.length} document{readyDocs.length !== 1 ? 's' : ''} saved
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Stored as Standard Industry Format and ready to download.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    className={`${CTA} w-full justify-center`}
                    onClick={() => downloadSIF(docs)}
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Download SIF
                  </Button>
                  <Button
                    variant="outline"
                    className={`${BTN_OUTLINE} w-full justify-center`}
                    onClick={() => { setShowSaved(false); setStep('upload'); setFiles([]); setDocs([]) }}
                  >
                    Done
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
