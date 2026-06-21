import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CarbonTwin } from '../../src/pages/CarbonTwin';
import '@testing-library/jest-dom';

// Mock framer-motion to avoid JSDOM/window lifecycle errors
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    span: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <span ref={ref} {...props}>{children}</span>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock recharts to avoid SVG/JSDOM measurement issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div data-testid="line-chart-line" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />
}));

// Mock AuthContext
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      displayName: 'Eco Pioneer Test',
      email: 'test@carbonmind.ai',
      level: 11,
      ecoScore: 84,
      onboardingData: {
        basicInfo: {
          currency: '₹',
          occupation: 'Sustainability Lead'
        }
      }
    },
    logActivity: vi.fn()
  })
}));

const mockTwinResponse = {
  success: true,
  twinProfile: {
    personality: "Climate Hero",
    lifestyleType: "Net Zero Pioneer",
    sustainabilityLevel: "Advanced",
    carbonAge: 22,
    planetImpactScore: 920,
    environmentalRank: "Top 1% in your region"
  },
  legacyIndex: {
    earthsNeeded: 1.2,
    legacyRating: "Earth Protector"
  },
  insights: [
    "Insight 1: Energy efficiency offsets",
    "Insight 2: Plastic recycling impacts"
  ],
  aiCoaching: "AI Coach Recommendation: Invest in renewable solar panels.",
  timelinePredictions: {
    "1m": { "carbonEmittedKg": 100, "moneySaved": 200, "treesEquivalent": 5, "waterSavedL": 100, "achievements": ["Future Thinker"] },
    "3m": { "carbonEmittedKg": 300, "moneySaved": 600, "treesEquivalent": 15, "waterSavedL": 300, "achievements": ["Future Thinker"] },
    "6m": { "carbonEmittedKg": 600, "moneySaved": 1200, "treesEquivalent": 30, "waterSavedL": 600, "achievements": ["Future Thinker"] },
    "1y": { "carbonEmittedKg": 1200, "moneySaved": 2400, "treesEquivalent": 60, "waterSavedL": 1200, "achievements": ["Future Thinker"] },
    "5y": { "carbonEmittedKg": 6000, "moneySaved": 12000, "treesEquivalent": 300, "waterSavedL": 6000, "achievements": ["Future Thinker"] },
    "10y": { "carbonEmittedKg": 12000, "moneySaved": 24000, "treesEquivalent": 600, "waterSavedL": 1200, "achievements": ["Future Thinker"] }
  },
  futureTrends: [
    { name: "0 Mo", "Baseline Emissions": 0, "Projected Emissions": 0 },
    { name: "2 Mo", "Baseline Emissions": 560, "Projected Emissions": 560 }
  ],
  digitalEarth: {
    greenCoveragePct: 50,
    iceCapStabilityPct: 50,
    atmosphereClarityPct: 60,
    cityGreeningPct: 30,
    animalsPresent: ["Honeybees"]
  },
  personalForest: {
    treeCount: 10,
    forestSizeSqM: 65,
    forestHealth: "Healthy",
    species: [
      { name: "Giant Redwood", count: 2, offsetPerYear: 44 }
    ]
  },
  climateSimulator: {
    yr2030: { projectedCarbonKg: 1000, legacyScore: 800, globalRank: 12000 },
    yr2040: { projectedCarbonKg: 3000, legacyScore: 850, globalRank: 8000 },
    yr2050: { projectedCarbonKg: 5000, legacyScore: 900, globalRank: 3500 }
  },
  communityRankings: {
    friends: [
      { name: "You (Twin)", rank: 1, score: 920 }
    ],
    family: [
      { name: "Mom", rank: 1, score: 820 }
    ],
    city: { rank: 340, totalParticipants: 18000, averageScore: 650 },
    globalAverage: 590
  },
  aiMissions: [
    { id: "m1", title: "Mission 1", xp: 100, coins: 10, completed: false }
  ]
};

describe('CarbonTwin Page Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTwinResponse
    });
  });

  it('renders loading state initially', () => {
    render(<CarbonTwin />);
    expect(screen.getByText(/Syncing Carbon Twin/i)).toBeInTheDocument();
  });

  it('renders twin data details once fetched', async () => {
    render(<CarbonTwin />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Syncing Carbon Twin/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Carbon Twin™')).toBeInTheDocument();
    expect(screen.getByText('Climate Hero')).toBeInTheDocument();
    expect(screen.getByText('Net Zero Pioneer')).toBeInTheDocument();
    expect(screen.getByText('920')).toBeInTheDocument();
    expect(screen.getByText(/1.2 Earths/i)).toBeInTheDocument();
  });

  it('toggles simulation inputs and requests new twin projections', async () => {
    render(<CarbonTwin />);

    await waitFor(() => {
      expect(screen.queryByText(/Syncing Carbon Twin/i)).not.toBeInTheDocument();
    });

    const initialCalls = (global.fetch as any).mock.calls.length;

    const vegButton = screen.getByText('Adopt vegetarian meals');
    fireEvent.click(vegButton);

    expect((global.fetch as any).mock.calls.length).toBeGreaterThan(initialCalls);
  });
});
