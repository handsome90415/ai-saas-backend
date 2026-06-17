import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2024 AI Content Generator/)).toBeInTheDocument()
  })
})
