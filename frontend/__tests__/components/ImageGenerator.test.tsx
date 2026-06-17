import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageGenerator } from '@/components/generator/ImageGenerator'
import { ToastProvider } from '@/contexts/ToastContext'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('ImageGenerator', () => {
  it('renders input and buttons', () => {
    const onResult = jest.fn()
    render(<ImageGenerator onResult={onResult} />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/一杯精緻的拿鐵咖啡/)).toBeInTheDocument()
    expect(screen.getByText('生成圖片')).toBeInTheDocument()
  })

  it('disables button when prompt is empty', () => {
    const onResult = jest.fn()
    render(<ImageGenerator onResult={onResult} />, { wrapper: Wrapper })
    const button = screen.getByText('生成圖片')
    expect(button).toBeDisabled()
  })

  it('enables button when prompt is entered', () => {
    const onResult = jest.fn()
    render(<ImageGenerator onResult={onResult} />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/一杯精緻的拿鐵咖啡/)
    fireEvent.change(input, { target: { value: 'test image' } })
    const button = screen.getByText('生成圖片')
    expect(button).not.toBeDisabled()
  })
})
