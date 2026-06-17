import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import SettingsPage from '@/app/settings/page'
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

describe('SettingsPage', () => {
  it('renders without crashing', () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    expect(document.body).toBeInTheDocument()
  })

  it('shows loading or settings content', () => {
    render(<SettingsPage />, { wrapper: Wrapper })
    const hasContent = screen.queryByText('帳號設定') || screen.queryByText('載入中...')
    expect(hasContent || document.querySelector('.animate-pulse')).toBeTruthy()
  })
})
