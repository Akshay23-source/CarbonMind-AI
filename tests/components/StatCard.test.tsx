import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../../src/components/StatCard';
import { Activity } from 'lucide-react';
import '@testing-library/jest-dom';

describe('StatCard Component', () => {
  it('renders the title and value correctly', () => {
    render(
      <StatCard
        title="Weekly Saved Carbon"
        value="48.5 kg"
        icon={<Activity data-testid="mock-icon" />}
      />
    );
    expect(screen.getByText('Weekly Saved Carbon')).toBeInTheDocument();
    expect(screen.getByText('48.5 kg')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders the change values and labels correctly', () => {
    render(
      <StatCard
        title="Eco Savings"
        value="100"
        change={-15}
        changeLabel="since yesterday"
        icon={<Activity />}
      />
    );
    expect(screen.getByText('-15%')).toBeInTheDocument();
    expect(screen.getByText('since yesterday')).toBeInTheDocument();
  });

  it('displays the environmental impact description when provided', () => {
    render(
      <StatCard
        title="Carbon Saved"
        value="50 kg"
        icon={<Activity />}
        description="Preserves biological integrity by lowering community outputs."
      />
    );
    expect(
      screen.getByText('Preserves biological integrity by lowering community outputs.')
    ).toBeInTheDocument();
  });
});
