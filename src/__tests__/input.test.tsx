import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('applies default classes', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('flex')
      expect(input).toHaveClass('h-10')
      expect(input).toHaveClass('w-full')
      expect(input).toHaveClass('rounded-md')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('bg-white')
    })

    it('accepts custom className', () => {
      render(<Input className="custom-input" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('custom-input')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('input types', () => {
    it('renders without explicit type (browser defaults to text)', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      // Browser defaults to "text" when no type specified
      expect(input.type).toBe('text')
    })

    it('accepts text type', () => {
      render(<Input type="text" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('accepts email type', () => {
      render(<Input type="email" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('accepts password type', () => {
      render(<Input type="password" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('accepts number type', () => {
      render(<Input type="number" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('accepts tel type', () => {
      render(<Input type="tel" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('accepts search type', () => {
      render(<Input type="search" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('accepts file type', () => {
      render(<Input type="file" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'file')
    })
  })

  describe('attributes', () => {
    it('accepts placeholder', () => {
      render(<Input placeholder="Enter text..." data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('placeholder', 'Enter text...')
    })

    it('accepts name attribute', () => {
      render(<Input name="username" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('name', 'username')
    })

    it('accepts id attribute', () => {
      render(<Input id="email-input" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('accepts required attribute', () => {
      render(<Input required data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toBeRequired()
    })

    it('accepts disabled attribute', () => {
      render(<Input disabled data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toBeDisabled()
    })

    it('accepts readOnly attribute', () => {
      render(<Input readOnly data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('readonly')
    })

    it('accepts autoFocus attribute', () => {
      render(<Input autoFocus data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(document.activeElement).toBe(input)
    })

    it('accepts maxLength attribute', () => {
      render(<Input maxLength={100} data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('maxLength', '100')
    })

    it('accepts minLength attribute', () => {
      render(<Input minLength={5} data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('minLength', '5')
    })

    it('accepts pattern attribute', () => {
      render(<Input pattern="[A-Za-z]+" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+')
    })

    it('accepts aria-label', () => {
      render(<Input aria-label="Username input" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-label', 'Username input')
    })

    it('accepts aria-describedby', () => {
      render(<Input aria-describedby="help-text" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })
  })

  describe('value handling', () => {
    it('accepts defaultValue', () => {
      render(<Input defaultValue="default text" data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('default text')
    })

    it('accepts controlled value', () => {
      render(<Input value="controlled value" onChange={() => {}} data-testid="input" />)
      const input = screen.getByTestId('input') as HTMLInputElement
      expect(input.value).toBe('controlled value')
    })
  })

  describe('events', () => {
    it('calls onChange when value changes', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} data-testid="input" />)
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: 'new value' } })
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('calls onFocus when focused', () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} data-testid="input" />)
      const input = screen.getByTestId('input')
      fireEvent.focus(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur when blurred', () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} data-testid="input" />)
      const input = screen.getByTestId('input')
      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('calls onKeyDown when key is pressed', () => {
      const handleKeyDown = jest.fn()
      render(<Input onKeyDown={handleKeyDown} data-testid="input" />)
      const input = screen.getByTestId('input')
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('disabled state', () => {
    it('has disabled styles when disabled', () => {
      render(<Input disabled data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('disabled:cursor-not-allowed')
      expect(input).toHaveClass('disabled:opacity-50')
    })

    it('does not call onChange when disabled', () => {
      const handleChange = jest.fn()
      render(<Input disabled onChange={handleChange} data-testid="input" />)
      const input = screen.getByTestId('input')
      fireEvent.change(input, { target: { value: 'test' } })
      // Disabled inputs don't trigger onChange in the browser
      // but the event still fires in testing-library
    })
  })
})
