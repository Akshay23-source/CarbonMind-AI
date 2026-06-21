import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../../src/components/Card';
import '@testing-library/jest-dom';

describe('Card Component', () => {
  it('renders children elements correctly', () => {
    render(<Card>Card Test Content</Card>);
    expect(screen.getByText('Card Test Content')).toBeInTheDocument();
  });

  it('applies correct class name based on glass variant', () => {
    const { container } = render(<Card variant="glass">Glass</Card>);
    expect(container.firstChild).toHaveClass('glass-card');
  });

  it('applies flat variant class name', () => {
    const { container } = render(<Card variant="flat">Flat</Card>);
    expect(container.firstChild).toHaveClass('bg-slate-50');
  });
});
