import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.stubGlobal('DOMMatrix', class DOMMatrix {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
  constructor(transform?: string) { /* noop */ }
  multiply(): DOMMatrix { return this }
  translate(): DOMMatrix { return this }
  scale(): DOMMatrix { return this }
  rotate(): DOMMatrix { return this }
  inverse(): DOMMatrix { return this }
  flipX(): DOMMatrix { return this }
  flipY(): DOMMatrix { return this }
})

vi.mock('pdfjs-dist', () => {
  const mockGetPage = vi.fn()
  const mockGetTextContent = vi.fn()

  return {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn().mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: mockGetPage.mockResolvedValue({
          getTextContent: mockGetTextContent.mockResolvedValue({
            items: [],
          }),
        }),
      }),
    }),
    version: '4.0.0',
  }
})

vi.mock('mammoth', () => ({
  default: { convertToHtml: vi.fn().mockResolvedValue({ value: '' }) },
  convertToHtml: vi.fn().mockResolvedValue({ value: '' }),
}))
