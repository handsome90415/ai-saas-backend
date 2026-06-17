import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TextGenerator } from '@/components/generator/TextGenerator'
import { ToastProvider } from '@/contexts/ToastContext'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('TextGenerator', () => {
  it('renders input and buttons', () => {
    const onResult = jest.fn()
    render(<TextGenerator onResult={onResult} />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/推銷一款新的咖啡機/)).toBeInTheDocument()
    expect(screen.getByText('生成文案')).toBeInTheDocument()
  })

  it('disables button when prompt is empty', () => {
    const onResult = jest.fn()
    render(<TextGenerator onResult={onResult} />, { wrapper: Wrapper })
    const button = screen.getByText('生成文案')
    expect(button).toBeDisabled()
  })

  it('enables button when prompt is entered', () => {
    const onResult = jest.fn()
    render(<TextGenerator onResult={onResult} />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/推銷一款新的咖啡機/)
    fireEvent.change(input, { target: { value: 'test prompt' } })
    const button = screen.getByText('生成文案')
    expect(button).not.toBeDisabled()
  })
})
