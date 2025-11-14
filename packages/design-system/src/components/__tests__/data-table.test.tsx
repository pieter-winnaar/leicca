import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable } from '../data-table';
import { ColumnDef } from '@tanstack/react-table';

type TestData = {
  id: string;
  name: string;
  email: string;
};

const testData: TestData[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' },
];

const testColumns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

describe('DataTable', () => {
  it('should render with data', () => {
    render(<DataTable columns={testColumns} data={testData} />);

    // Check that data is rendered
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('should render column headers', () => {
    render(<DataTable columns={testColumns} data={testData} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    const emptyState = <div>No data available</div>;
    render(
      <DataTable
        columns={testColumns}
        data={[]}
        emptyState={emptyState}
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render default empty message when no data and no custom empty state', () => {
    render(<DataTable columns={testColumns} data={[]} />);

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('should render pagination when enabled', () => {
    const longData = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    }));

    render(
      <DataTable
        columns={testColumns}
        data={longData}
        enablePagination={true}
        pageSize={10}
      />
    );

    // Check pagination controls exist
    expect(screen.getByText('Rows per page')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should not render pagination when disabled', () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enablePagination={false}
      />
    );

    // Pagination should not exist
    expect(screen.queryByText('Rows per page')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <DataTable
        columns={testColumns}
        data={testData}
        className="custom-class"
      />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });
});
