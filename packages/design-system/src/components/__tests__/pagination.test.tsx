import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Pagination, PaginationContent, PaginationItem } from '../pagination';

describe('Pagination', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>1</PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(container).toBeTruthy();
  });
});
