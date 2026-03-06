/**
 * Tests for DataTable component (components/ui/data-table.tsx)
 *
 * Strategy:
 * - Define simple test data + columns
 * - Render DataTable and assert structure, content, pagination, filtering
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../components/ui/data-table'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
interface Person {
  id: number
  name: string
  role: string
  email: string
}

const mockColumns: ColumnDef<Person>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span>{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <span>{row.getValue('role')}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span>{row.getValue('email')}</span>,
  },
]

function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    role: i % 2 === 0 ? 'manager' : 'salesperson',
    email: `person${i + 1}@company.com`,
  }))
}

// ===========================================================================
// 1. Empty state
// ===========================================================================
describe('DataTable — empty state', () => {
  it('shows "No results." when data is empty', () => {
    render(<DataTable columns={mockColumns} data={[]} />)
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('still renders column headers when data is empty', () => {
    render(<DataTable columns={mockColumns} data={[]} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })
})

// ===========================================================================
// 2. Rendering data
// ===========================================================================
describe('DataTable — data rendering', () => {
  it('renders all rows when count <= pageSize', () => {
    const data = makePeople(5)
    render(<DataTable columns={mockColumns} data={data} />)
    for (const p of data) {
      expect(screen.getByText(p.name)).toBeInTheDocument()
    }
  })

  it('renders column headers', () => {
    render(<DataTable columns={mockColumns} data={makePeople(3)} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders cell values correctly', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[{ id: 1, name: 'Alice', role: 'admin', email: 'alice@co.com' }]}
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('alice@co.com')).toBeInTheDocument()
  })

  it('renders correct number of rows', () => {
    const data = makePeople(7)
    render(<DataTable columns={mockColumns} data={data} />)
    const rows = screen.getAllByText(/Person \d+/)
    expect(rows.length).toBe(7)
  })
})

// ===========================================================================
// 3. Pagination
// ===========================================================================
describe('DataTable — pagination', () => {
  it('Previous button is disabled on first page', () => {
    render(<DataTable columns={mockColumns} data={makePeople(15)} pageSize={10} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('Next button is enabled when there are more pages', () => {
    render(<DataTable columns={mockColumns} data={makePeople(15)} pageSize={10} />)
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('shows only pageSize rows on first page', () => {
    render(<DataTable columns={mockColumns} data={makePeople(15)} pageSize={5} />)
    const rows = screen.getAllByText(/Person \d+/)
    expect(rows.length).toBe(5)
  })

  it('navigates to next page on Next click', () => {
    render(<DataTable columns={mockColumns} data={makePeople(15)} pageSize={5} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    // Page 2 should show Person 6-10
    expect(screen.getByText('Person 6')).toBeInTheDocument()
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument()
  })

  it('navigates back to previous page on Previous click', () => {
    render(<DataTable columns={mockColumns} data={makePeople(15)} pageSize={5} />)
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(screen.getByText('Person 1')).toBeInTheDocument()
  })

  it('Next button is disabled on last page', () => {
    render(<DataTable columns={mockColumns} data={makePeople(5)} pageSize={10} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('shows total results count', () => {
    render(<DataTable columns={mockColumns} data={makePeople(12)} pageSize={10} />)
    expect(screen.getByText(/of 12 results/i)).toBeInTheDocument()
  })

  it('shows "Showing 1 to N" text on first page', () => {
    render(<DataTable columns={mockColumns} data={makePeople(12)} pageSize={10} />)
    expect(screen.getByText(/showing 1 to 10/i)).toBeInTheDocument()
  })

  it('uses default pageSize of 10 when not provided', () => {
    const data = makePeople(25)
    render(<DataTable columns={mockColumns} data={data} />)
    // Should show 10 rows on first page
    const rows = screen.getAllByText(/Person \d+/)
    expect(rows.length).toBe(10)
  })
})

// ===========================================================================
// 4. Search / filtering
// ===========================================================================
describe('DataTable — filtering', () => {
  it('filters rows by searchKey + searchValue', () => {
    const data: Person[] = [
      { id: 1, name: 'Alice', role: 'manager', email: 'alice@co.com' },
      { id: 2, name: 'Bob', role: 'salesperson', email: 'bob@co.com' },
      { id: 3, name: 'Alice Two', role: 'admin', email: 'alice2@co.com' },
    ]
    render(
      <DataTable
        columns={mockColumns}
        data={data}
        searchKey="name"
        searchValue="Alice"
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Alice Two')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('shows all rows when searchValue is empty string', () => {
    const data = makePeople(5)
    render(
      <DataTable
        columns={mockColumns}
        data={data}
        searchKey="name"
        searchValue=""
      />
    )
    const rows = screen.getAllByText(/Person \d+/)
    expect(rows.length).toBe(5)
  })

  it('clears filter when searchKey removed', () => {
    const data: Person[] = [
      { id: 1, name: 'Alice', role: 'manager', email: 'a@co.com' },
      { id: 2, name: 'Bob', role: 'user', email: 'b@co.com' },
    ]
    const { rerender } = render(
      <DataTable
        columns={mockColumns}
        data={data}
        searchKey="name"
        searchValue="Alice"
      />
    )
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()

    rerender(<DataTable columns={mockColumns} data={data} />)
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows "No results." when filter matches nothing', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={makePeople(5)}
        searchKey="name"
        searchValue="XYZ_NO_MATCH"
      />
    )
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('shows filtered count in pagination text', () => {
    const data: Person[] = [
      { id: 1, name: 'Alice', role: 'manager', email: 'a@co.com' },
      { id: 2, name: 'Bob', role: 'user', email: 'b@co.com' },
    ]
    render(
      <DataTable
        columns={mockColumns}
        data={data}
        searchKey="name"
        searchValue="Alice"
      />
    )
    expect(screen.getByText(/of 1 results/i)).toBeInTheDocument()
  })
})

// ===========================================================================
// 5. Sorting
// ===========================================================================
describe('DataTable — sorting', () => {
  it('renders table with sortable columns (click on header)', () => {
    // Add sortable header
    const sortableColumns: ColumnDef<Person>[] = [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()}>Name</button>
        ),
        cell: ({ row }) => <span>{row.getValue('name')}</span>,
      },
    ]
    const data: Person[] = [
      { id: 1, name: 'Charlie', role: 'user', email: 'c@co.com' },
      { id: 2, name: 'Alice', role: 'user', email: 'a@co.com' },
      { id: 3, name: 'Bob', role: 'user', email: 'b@co.com' },
    ]
    render(<DataTable columns={sortableColumns} data={data} />)
    // Click sort button
    fireEvent.click(screen.getByRole('button', { name: 'Name' }))
    const rows = screen.getAllByText(/^[ABC][a-z]+$/)
    expect(rows[0].textContent).toBe('Alice')
    expect(rows[1].textContent).toBe('Bob')
    expect(rows[2].textContent).toBe('Charlie')
  })
})
