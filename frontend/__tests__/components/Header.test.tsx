import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/Header'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider } from '@/contexts/AuthContext'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>{children}</AuthProvider>
  </ToastProvider>
)

describe('Header', () => {
  it('renders logo', () => {
    render(<Header />, { wrapper: Wrapper })
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('Content Generator')).toBeInTheDocument()
  })

  it('shows login/signup when unauthenticated', async () => {
    render(<Header />, { wrapper: Wrapper })
    expect(await screen.findByText('登入')).toBeInTheDocument()
    expect(await screen.findByText('開始使用')).toBeInTheDocument()
  })
})
