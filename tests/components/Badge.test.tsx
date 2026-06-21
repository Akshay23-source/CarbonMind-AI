import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../src/components/Badge';
import '@testing-library/jest-dom';

describe('Badge Component', () => {
  it('renders child text content correctly', () => {
    render(<Badge>Eco Hero</Badge>);
    expect(screen.getByText('Eco Hero')).toBeInTheDocument();
  });

  it('applies the appropriate size class names', () => {
    const { container: containerSm } = render(<Badge size="sm">Small</Badge>);
    const { container: containerMd } = render(<Badge size="md">Medium</Badge>);
    
    expect(containerSm.firstChild).toHaveClass('text-[10px]');
    expect(containerMd.firstChild).toHaveClass('text-xs');
  });

  it('renders standard design variants correctly', () => {
    const { container: containerSuccess } = render(<Badge variant="success">Success</Badge>);
    const { container: containerPremium } = render(<Badge variant="premium">Premium</Badge>);

    expect(containerSuccess.firstChild).toHaveClass('bg-emerald-500/10');
    expect(containerPremium.firstChild).toHaveClass('bg-gradient-to-r');
  });
});
