import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/app/components/ui/Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button title="Test" aria-label="Test button">Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick} title="Test" aria-label="Test button">
        Click me
      </Button>
    )
    const button = screen.getByText('Click me')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant styles', () => {
    render(
      <Button variant="primary" title="Test" aria-label="Test button">
        Primary
      </Button>
    )
    const button = screen.getByText('Primary')
    expect(button).toHaveClass('bg-blue-600')
  })

  it('applies secondary variant styles', () => {
    render(
      <Button variant="secondary" title="Test" aria-label="Test button">
        Secondary
      </Button>
    )
    const button = screen.getByText('Secondary')
    expect(button).toHaveClass('bg-gray-200')
  })

  it('disables button when disabled prop is true', () => {
    render(
      <Button disabled title="Test" aria-label="Test button">
        Disabled
      </Button>
    )
    const button = screen.getByText('Disabled')
    expect(button).toBeDisabled()
  })
})
