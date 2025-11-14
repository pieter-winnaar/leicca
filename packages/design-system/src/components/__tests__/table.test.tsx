import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../table';

describe('Table', () => {
  it('renders table with header and body', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Table className="custom-class">
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = container.querySelector('table');
    expect(table).toHaveClass('custom-class');
  });
});
