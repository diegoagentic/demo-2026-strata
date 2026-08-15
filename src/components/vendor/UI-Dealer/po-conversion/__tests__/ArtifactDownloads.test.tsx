import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ArtifactDownloads from '../ArtifactDownloads'
import type { POArtifact } from '../types'

const MOCK_ARTIFACTS: POArtifact[] = [
    {
        id: 'a1',
        fileName: 'PO-2026-0047_submission.pdf',
        format: 'pdf',
        fileSize: 245760,
        createdAt: '2026-04-10T11:00:00Z',
        downloadUrl: '/api/artifacts/a1',
        type: 'submission_payload',
    },
    {
        id: 'a2',
        fileName: 'PO-2026-0047_confirmation.csv',
        format: 'csv',
        fileSize: 8192,
        createdAt: '2026-04-10T12:00:00Z',
        downloadUrl: '/api/artifacts/a2',
        type: 'confirmation',
    },
]

describe('ArtifactDownloads', () => {
    it('renders empty state when no artifacts', () => {
        render(<ArtifactDownloads artifacts={[]} />)
        expect(screen.getByText('No artifacts yet')).toBeInTheDocument()
    })

    it('renders loading skeleton', () => {
        const { container } = render(<ArtifactDownloads artifacts={[]} loading />)
        expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('renders artifact file names', () => {
        render(<ArtifactDownloads artifacts={MOCK_ARTIFACTS} />)
        expect(screen.getByText('PO-2026-0047_submission.pdf')).toBeInTheDocument()
        expect(screen.getByText('PO-2026-0047_confirmation.csv')).toBeInTheDocument()
    })

    it('groups artifacts by type', () => {
        render(<ArtifactDownloads artifacts={MOCK_ARTIFACTS} />)
        expect(screen.getByText('Submission Payloads')).toBeInTheDocument()
        expect(screen.getByText('Confirmations')).toBeInTheDocument()
    })

    it('renders download links', () => {
        render(<ArtifactDownloads artifacts={MOCK_ARTIFACTS} />)
        const links = screen.getAllByRole('link')
        expect(links[0]).toHaveAttribute('href', '/api/artifacts/a1')
    })

    it('shows preview button for PDF artifacts', () => {
        render(<ArtifactDownloads artifacts={MOCK_ARTIFACTS} />)
        const previewBtns = screen.getAllByTitle('Preview PDF')
        expect(previewBtns.length).toBe(1) // only the PDF has preview
    })
})
