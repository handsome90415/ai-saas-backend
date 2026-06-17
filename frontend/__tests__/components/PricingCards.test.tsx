import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { PricingCards } from '@/components/pricing/PricingCards'

describe('PricingCards', () => {
  it('renders all three plans', () => {
    render(<PricingCards />)
    expect(screen.getByText('免費版')).toBeInTheDocument()
    expect(screen.getByText('專業版')).toBeInTheDocument()
    expect(screen.getByText('企業版')).toBeInTheDocument()
  })

  it('displays correct prices', () => {
    render(<PricingCards />)
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('$9.99')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('shows featured badge on pro plan', () => {
    render(<PricingCards />)
    expect(screen.getByText('最受歡迎')).toBeInTheDocument()
  })
})
