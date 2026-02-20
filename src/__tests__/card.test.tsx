import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('bg-white')
      expect(card).toHaveClass('shadow-sm')
    })

    it('accepts custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('passes through additional props', () => {
      render(<Card data-testid="card" aria-label="Test card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('aria-label', 'Test card')
    })
  })

  describe('CardHeader', () => {
    it('renders children', () => {
      render(<CardHeader>Header content</CardHeader>)
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardHeader data-testid="header">Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('p-6')
    })

    it('accepts custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardHeader ref={ref}>Content</CardHeader>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardTitle', () => {
    it('renders children', () => {
      render(<CardTitle>Title text</CardTitle>)
      expect(screen.getByText('Title text')).toBeInTheDocument()
    })

    it('renders as h3 element', () => {
      render(<CardTitle>Title text</CardTitle>)
      const title = screen.getByText('Title text')
      expect(title.tagName).toBe('H3')
    })

    it('applies default classes', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-semibold')
    })

    it('accepts custom className', () => {
      render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('custom-title')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<CardTitle ref={ref}>Title</CardTitle>)
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
    })
  })

  describe('CardDescription', () => {
    it('renders children', () => {
      render(<CardDescription>Description text</CardDescription>)
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('renders as p element', () => {
      render(<CardDescription>Description</CardDescription>)
      const desc = screen.getByText('Description')
      expect(desc.tagName).toBe('P')
    })

    it('applies default classes', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>)
      const desc = screen.getByTestId('desc')
      expect(desc).toHaveClass('text-sm')
      expect(desc).toHaveClass('text-muted')
    })

    it('accepts custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="desc">Description</CardDescription>)
      const desc = screen.getByTestId('desc')
      expect(desc).toHaveClass('custom-desc')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<CardDescription ref={ref}>Description</CardDescription>)
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
    })
  })

  describe('CardContent', () => {
    it('renders children', () => {
      render(<CardContent>Content text</CardContent>)
      expect(screen.getByText('Content text')).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('pt-0')
    })

    it('accepts custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardContent ref={ref}>Content</CardContent>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardFooter', () => {
    it('renders children', () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('applies default classes', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('p-6')
      expect(footer).toHaveClass('pt-0')
    })

    it('accepts custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CardFooter ref={ref}>Footer</CardFooter>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Card composition', () => {
    it('renders a complete card with all parts', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Test Card Title</CardTitle>
            <CardDescription>This is a description</CardDescription>
          </CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer actions</CardFooter>
        </Card>
      )

      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByText('Test Card Title')).toBeInTheDocument()
      expect(screen.getByText('This is a description')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer actions')).toBeInTheDocument()
    })

    it('renders card without header', () => {
      render(
        <Card data-testid="card">
          <CardContent>Content only</CardContent>
        </Card>
      )

      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByText('Content only')).toBeInTheDocument()
    })

    it('renders card without footer', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})
