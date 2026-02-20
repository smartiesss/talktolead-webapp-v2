import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Badge, badgeVariants } from '@/components/ui/badge'

describe('Badge', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Badge>Badge text</Badge>)
      expect(screen.getByText('Badge text')).toBeInTheDocument()
    })

    it('renders as a div element', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.tagName).toBe('DIV')
    })

    it('applies base classes', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('inline-flex')
      expect(badge).toHaveClass('items-center')
      expect(badge).toHaveClass('rounded-full')
      expect(badge).toHaveClass('text-xs')
      expect(badge).toHaveClass('font-semibold')
    })

    it('accepts custom className', () => {
      render(<Badge className="custom-badge" data-testid="badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('custom-badge')
    })

    it('passes through additional props', () => {
      render(<Badge data-testid="badge" aria-label="Status badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
    })
  })

  describe('variants', () => {
    it('applies default variant by default', () => {
      render(<Badge data-testid="badge">Default</Badge>)
      const badge = screen.getByTestId('badge')
      // Default variant classes
      expect(badge).toHaveClass('bg-primary/10')
      expect(badge).toHaveClass('text-primary')
    })

    it('applies default variant when explicitly set', () => {
      render(<Badge variant="default" data-testid="badge">Default</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-primary/10')
      expect(badge).toHaveClass('text-primary')
    })

    it('applies secondary variant', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-secondary/10')
      expect(badge).toHaveClass('text-secondary-700')
    })

    it('applies destructive variant', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-destructive/10')
      expect(badge).toHaveClass('text-destructive')
    })

    it('applies outline variant', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('border-border')
      expect(badge).toHaveClass('text-foreground')
    })

    it('applies success variant', () => {
      render(<Badge variant="success" data-testid="badge">Success</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-green-100')
      expect(badge).toHaveClass('text-green-700')
    })

    it('applies warning variant', () => {
      render(<Badge variant="warning" data-testid="badge">Warning</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-amber-100')
      expect(badge).toHaveClass('text-amber-700')
    })

    it('applies info variant', () => {
      render(<Badge variant="info" data-testid="badge">Info</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-blue-100')
      expect(badge).toHaveClass('text-blue-700')
    })
  })

  describe('badgeVariants', () => {
    it('generates default variant classes', () => {
      const classes = badgeVariants({ variant: 'default' })
      expect(classes).toContain('bg-primary/10')
      expect(classes).toContain('text-primary')
    })

    it('generates secondary variant classes', () => {
      const classes = badgeVariants({ variant: 'secondary' })
      expect(classes).toContain('bg-secondary/10')
    })

    it('generates destructive variant classes', () => {
      const classes = badgeVariants({ variant: 'destructive' })
      expect(classes).toContain('bg-destructive/10')
    })

    it('generates outline variant classes', () => {
      const classes = badgeVariants({ variant: 'outline' })
      expect(classes).toContain('border')
    })

    it('generates success variant classes', () => {
      const classes = badgeVariants({ variant: 'success' })
      expect(classes).toContain('bg-green-100')
    })

    it('generates warning variant classes', () => {
      const classes = badgeVariants({ variant: 'warning' })
      expect(classes).toContain('bg-amber-100')
    })

    it('generates info variant classes', () => {
      const classes = badgeVariants({ variant: 'info' })
      expect(classes).toContain('bg-blue-100')
    })

    it('includes base classes for all variants', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'info'] as const
      
      variants.forEach(variant => {
        const classes = badgeVariants({ variant })
        expect(classes).toContain('inline-flex')
        expect(classes).toContain('items-center')
        expect(classes).toContain('rounded-full')
        expect(classes).toContain('text-xs')
        expect(classes).toContain('font-semibold')
      })
    })
  })

  describe('use cases', () => {
    it('renders status badge', () => {
      render(<Badge variant="success">Active</Badge>)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders count badge', () => {
      render(<Badge>5</Badge>)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders with icon and text', () => {
      render(
        <Badge data-testid="badge">
          <span>🔥</span>
          <span>Hot</span>
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('🔥')
      expect(badge).toHaveTextContent('Hot')
    })

    it('renders multiple badges together', () => {
      render(
        <div>
          <Badge variant="success">Published</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Error</Badge>
        </div>
      )
      expect(screen.getByText('Published')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('can be used in a list', () => {
      const tags = ['React', 'TypeScript', 'Next.js']
      render(
        <div>
          {tags.map(tag => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )
      tags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument()
      })
    })
  })
})
