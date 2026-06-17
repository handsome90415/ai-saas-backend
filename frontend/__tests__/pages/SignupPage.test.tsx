import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import SignupPage from '@/app/signup/page'
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

describe('SignupPage', () => {
  it('renders signup form', () => {
    render(<SignupPage />, { wrapper: Wrapper })
    expect(screen.getAllByText('註冊').length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('至少 6 個字元')).toBeInTheDocument()
  })

  it('renders back to home link', () => {
    render(<SignupPage />, { wrapper: Wrapper })
    expect(screen.getByText('← 回到主頁')).toBeInTheDocument()
  })

  it('renders login link', () => {
    render(<SignupPage />, { wrapper: Wrapper })
    expect(screen.getByText('登入')).toBeInTheDocument()
  })
})
