import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Select } from '@/components/ui/select'

describe('Select', () => {
  const defaultOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  describe('rendering', () => {
    it('renders a select element', () => {
      render(<Select options={defaultOptions} data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select.tagName).toBe('SELECT')
    })

    it('renders all options', () => {
      render(<Select options={defaultOptions} />)
      defaultOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('renders options with correct values', () => {
      render(<Select options={defaultOptions} data-testid="select" />)
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
      expect(options[0]).toHaveValue('option1')
      expect(options[1]).toHaveValue('option2')
      expect(options[2]).toHaveValue('option3')
    })

    it('renders chevron icon', () => {
      const { container } = render(<Select options={defaultOptions} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<Select options={defaultOptions} data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toHaveClass('flex')
      expect(select).toHaveClass('h-10')
      expect(select).toHaveClass('w-full')
      expect(select).toHaveClass('rounded-md')
      expect(select).toHaveClass('border')
      expect(select).toHaveClass('bg-white')
    })

    it('accepts custom className', () => {
      render(<Select options={defaultOptions} className="custom-select" data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toHaveClass('custom-select')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLSelectElement>()
      render(<Select options={defaultOptions} ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLSelectElement)
    })

    it('wraps select in relative container', () => {
      const { container } = render(<Select options={defaultOptions} />)
      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('relative')
    })
  })

  describe('attributes', () => {
    it('accepts name attribute', () => {
      render(<Select options={defaultOptions} name="country" data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('name', 'country')
    })

    it('accepts id attribute', () => {
      render(<Select options={defaultOptions} id="country-select" data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('id', 'country-select')
    })

    it('accepts required attribute', () => {
      render(<Select options={defaultOptions} required data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toBeRequired()
    })

    it('accepts disabled attribute', () => {
      render(<Select options={defaultOptions} disabled data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toBeDisabled()
    })

    it('accepts aria-label', () => {
      render(<Select options={defaultOptions} aria-label="Select country" data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('aria-label', 'Select country')
    })

    it('accepts aria-describedby', () => {
      render(<Select options={defaultOptions} aria-describedby="help-text" data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('aria-describedby', 'help-text')
    })
  })

  describe('value handling', () => {
    it('accepts defaultValue', () => {
      render(<Select options={defaultOptions} defaultValue="option2" data-testid="select" />)
      const select = screen.getByTestId('select') as HTMLSelectElement
      expect(select.value).toBe('option2')
    })

    it('accepts controlled value', () => {
      render(<Select options={defaultOptions} value="option3" onChange={() => {}} data-testid="select" />)
      const select = screen.getByTestId('select') as HTMLSelectElement
      expect(select.value).toBe('option3')
    })

    it('selects first option by default', () => {
      render(<Select options={defaultOptions} data-testid="select" />)
      const select = screen.getByTestId('select') as HTMLSelectElement
      expect(select.value).toBe('option1')
    })
  })

  describe('events', () => {
    it('calls onChange when value changes', () => {
      const handleChange = jest.fn()
      render(<Select options={defaultOptions} onChange={handleChange} data-testid="select" />)
      const select = screen.getByTestId('select')
      fireEvent.change(select, { target: { value: 'option2' } })
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('calls onFocus when focused', () => {
      const handleFocus = jest.fn()
      render(<Select options={defaultOptions} onFocus={handleFocus} data-testid="select" />)
      const select = screen.getByTestId('select')
      fireEvent.focus(select)
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('calls onBlur when blurred', () => {
      const handleBlur = jest.fn()
      render(<Select options={defaultOptions} onBlur={handleBlur} data-testid="select" />)
      const select = screen.getByTestId('select')
      fireEvent.blur(select)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('disabled state', () => {
    it('has disabled styles when disabled', () => {
      render(<Select options={defaultOptions} disabled data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toHaveClass('disabled:cursor-not-allowed')
      expect(select).toHaveClass('disabled:opacity-50')
    })

    it('cannot be focused when disabled', () => {
      render(<Select options={defaultOptions} disabled data-testid="select" />)
      const select = screen.getByTestId('select')
      expect(select).toBeDisabled()
    })
  })

  describe('different option configurations', () => {
    it('renders single option', () => {
      const singleOption = [{ value: 'only', label: 'Only Option' }]
      render(<Select options={singleOption} data-testid="select" />)
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(1)
    })

    it('renders many options', () => {
      const manyOptions = Array.from({ length: 10 }, (_, i) => ({
        value: `value${i}`,
        label: `Option ${i + 1}`,
      }))
      render(<Select options={manyOptions} data-testid="select" />)
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(10)
    })

    it('handles options with special characters', () => {
      const specialOptions = [
        { value: 'special', label: 'Option with "quotes"' },
        { value: 'unicode', label: '日本語オプション' },
        { value: 'emoji', label: '🌍 World' },
      ]
      render(<Select options={specialOptions} />)
      expect(screen.getByText('Option with "quotes"')).toBeInTheDocument()
      expect(screen.getByText('日本語オプション')).toBeInTheDocument()
      expect(screen.getByText('🌍 World')).toBeInTheDocument()
    })

    it('handles empty string values', () => {
      const emptyValueOptions = [
        { value: '', label: 'Select...' },
        { value: 'option1', label: 'Option 1' },
      ]
      render(<Select options={emptyValueOptions} data-testid="select" />)
      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveValue('')
    })
  })

  describe('use cases', () => {
    it('renders country selector', () => {
      const countries = [
        { value: 'hk', label: 'Hong Kong' },
        { value: 'cn', label: 'China' },
        { value: 'tw', label: 'Taiwan' },
        { value: 'jp', label: 'Japan' },
      ]
      render(<Select options={countries} name="country" aria-label="Select country" />)
      expect(screen.getByText('Hong Kong')).toBeInTheDocument()
      expect(screen.getByText('Japan')).toBeInTheDocument()
    })

    it('renders language selector', () => {
      const languages = [
        { value: 'en', label: 'English' },
        { value: 'zh', label: '中文' },
        { value: 'ja', label: '日本語' },
      ]
      render(<Select options={languages} name="language" aria-label="Select language" />)
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('中文')).toBeInTheDocument()
    })

    it('renders status filter', () => {
      const statuses = [
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
      ]
      render(<Select options={statuses} defaultValue="all" data-testid="status-filter" />)
      const select = screen.getByTestId('status-filter') as HTMLSelectElement
      expect(select.value).toBe('all')
    })
  })
})
