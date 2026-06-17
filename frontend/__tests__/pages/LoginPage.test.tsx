import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider } from '@/contexts/AuthContext'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>{children}</AuthProvider>
  </ToastProvider>
)

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />, { wrapper: Wrapper })
    expect(screen.getAllByText('登入').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders back to home link', () => {
    render(<LoginPage />, { wrapper: Wrapper })
    expect(screen.getByText('← 回到主頁')).toBeInTheDocument()
  })

  it('renders signup link', () => {
    render(<LoginPage />, { wrapper: Wrapper })
    expect(screen.getByText('註冊')).toBeInTheDocument()
  })
})
