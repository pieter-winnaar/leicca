import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { ThemeProvider } from '../ThemeProvider';

describe('Sidebar', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <Sidebar />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <ThemeProvider>
        <Sidebar className="custom-class" />
      </ThemeProvider>
    );
    expect(container.querySelector('.custom-class')).toBeTruthy();
  });
});
