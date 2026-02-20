import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Avatar } from '@/components/ui/avatar'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

describe('Avatar', () => {
  describe('without image (initials)', () => {
    it('renders initials from name', () => {
      render(<Avatar name="John Doe" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveTextContent('JD')
    })

    it('renders initials from single name', () => {
      render(<Avatar name="John" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveTextContent('J')
    })

    it('renders initials from three-part name', () => {
      render(<Avatar name="John Robert Doe" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      // getInitials returns first two initials
      expect(avatar).toHaveTextContent('JR')
    })

    it('applies default medium size', () => {
      render(<Avatar name="John Doe" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-10')
      expect(avatar).toHaveClass('w-10')
      expect(avatar).toHaveClass('text-sm')
    })

    it('applies small size', () => {
      render(<Avatar name="John Doe" size="sm" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-8')
      expect(avatar).toHaveClass('w-8')
      expect(avatar).toHaveClass('text-xs')
    })

    it('applies large size', () => {
      render(<Avatar name="John Doe" size="lg" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-12')
      expect(avatar).toHaveClass('w-12')
      expect(avatar).toHaveClass('text-base')
    })

    it('applies base styles for initials', () => {
      render(<Avatar name="John Doe" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('flex')
      expect(avatar).toHaveClass('items-center')
      expect(avatar).toHaveClass('justify-center')
      expect(avatar).toHaveClass('rounded-full')
      expect(avatar).toHaveClass('font-medium')
    })

    it('accepts custom className', () => {
      render(<Avatar name="John Doe" className="custom-avatar" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('custom-avatar')
    })

    it('passes through additional props', () => {
      render(<Avatar name="John Doe" aria-label="User avatar" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('aria-label', 'User avatar')
    })
  })

  describe('with image', () => {
    it('renders image when src is provided', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" data-testid="avatar" />)
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
    })

    it('uses name as alt text', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" data-testid="avatar" />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'John Doe')
    })

    it('applies size to image dimensions', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" size="lg" data-testid="avatar" />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('width', '48')
      expect(img).toHaveAttribute('height', '48')
    })

    it('applies medium image dimensions by default', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" data-testid="avatar" />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('width', '40')
      expect(img).toHaveAttribute('height', '40')
    })

    it('applies small image dimensions', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" size="sm" data-testid="avatar" />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('width', '32')
      expect(img).toHaveAttribute('height', '32')
    })

    it('applies base styles for image container', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('rounded-full')
      expect(avatar).toHaveClass('overflow-hidden')
    })

    it('does not show initials when image is present', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).not.toHaveTextContent('JD')
    })

    it('accepts custom className with image', () => {
      render(<Avatar name="John Doe" src="/avatar.jpg" className="custom-avatar" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('custom-avatar')
    })
  })

  describe('edge cases', () => {
    it('handles empty name gracefully', () => {
      render(<Avatar name="" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      // Should render but with empty or default content
      expect(avatar).toBeInTheDocument()
    })

    it('handles name with extra whitespace', () => {
      render(<Avatar name="  John   Doe  " data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      // getInitials should handle trimming
      expect(avatar).toBeInTheDocument()
    })

    it('handles special characters in name', () => {
      render(<Avatar name="José García" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveTextContent('JG')
    })

    it('handles Asian name', () => {
      render(<Avatar name="李明" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      // Should show first characters
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('use cases', () => {
    it('renders user profile avatar', () => {
      render(
        <Avatar 
          name="Jane Smith" 
          src="/profiles/jane.jpg" 
          size="lg"
          data-testid="profile-avatar"
        />
      )
      const avatar = screen.getByTestId('profile-avatar')
      expect(avatar).toBeInTheDocument()
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Jane Smith')
    })

    it('renders fallback avatar in comment', () => {
      render(
        <Avatar 
          name="Anonymous User" 
          size="sm"
          data-testid="comment-avatar"
        />
      )
      const avatar = screen.getByTestId('comment-avatar')
      expect(avatar).toHaveTextContent('AU')
    })

    it('renders multiple avatars in a list', () => {
      const users = [
        { name: 'Alice Brown', id: '1' },
        { name: 'Bob Smith', id: '2' },
        { name: 'Charlie Davis', id: '3' },
      ]

      render(
        <div>
          {users.map(user => (
            <Avatar key={user.id} name={user.name} data-testid={`avatar-${user.id}`} />
          ))}
        </div>
      )

      expect(screen.getByTestId('avatar-1')).toHaveTextContent('AB')
      expect(screen.getByTestId('avatar-2')).toHaveTextContent('BS')
      expect(screen.getByTestId('avatar-3')).toHaveTextContent('CD')
    })
  })
})
