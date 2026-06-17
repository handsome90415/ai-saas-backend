import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { GeneratorTabs } from '@/components/generator/GeneratorTabs'

describe('GeneratorTabs', () => {
  const textTab = <div>Text Content</div>
  const imageTab = <div>Image Content</div>
  const productTab = <div>Product Content</div>

  it('renders all three tabs', () => {
    render(<GeneratorTabs textTab={textTab} imageTab={imageTab} productTab={productTab} />)
    expect(screen.getByText('文案生成')).toBeInTheDocument()
    expect(screen.getByText('圖片生成')).toBeInTheDocument()
    expect(screen.getByText('產品圖片')).toBeInTheDocument()
  })

  it('shows text tab content by default', () => {
    render(<GeneratorTabs textTab={textTab} imageTab={imageTab} productTab={productTab} />)
    expect(screen.getByText('Text Content')).toBeInTheDocument()
  })

  it('switches to image tab on click', () => {
    render(<GeneratorTabs textTab={textTab} imageTab={imageTab} productTab={productTab} />)
    fireEvent.click(screen.getByText('圖片生成'))
    expect(screen.getByText('Image Content')).toBeInTheDocument()
  })

  it('switches to product tab on click', () => {
    render(<GeneratorTabs textTab={textTab} imageTab={imageTab} productTab={productTab} />)
    fireEvent.click(screen.getByText('產品圖片'))
    expect(screen.getByText('Product Content')).toBeInTheDocument()
  })
})
