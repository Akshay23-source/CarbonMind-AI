import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Profile } from '../../src/pages/Profile';
import '@testing-library/jest-dom';

// Mock context hook
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      displayName: 'Eco Pioneer Test',
      email: 'test@carbonmind.ai',
      level: 5,
      ecoScore: 92,
      onboardingData: {
        basicInfo: {
          occupation: 'Sustainability Lead'
        }
      }
    },
    updateProfile: vi.fn()
  })
}));

describe('Profile Page Component', () => {
  it('renders user details from Auth Context correctly', () => {
    render(<Profile />);
    expect(screen.getByText('Eco Pioneer Test')).toBeInTheDocument();
    expect(screen.getByText('Sustainability Lead')).toBeInTheDocument();
  });

  it('renders the correct Eco Score indicator', () => {
    render(<Profile />);
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  it('displays the Edit Profile action button', () => {
    render(<Profile />);
    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
  });
});
