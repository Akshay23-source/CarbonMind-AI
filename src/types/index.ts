/**
 * CarbonMind UI Client Type Definitions
 */

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}

export type CarbonCategory = 'energy' | 'travel' | 'food' | 'waste';

export interface CarbonActivity {
  id: string;
  userId: string;
  title: string;
  category: CarbonCategory;
  valueKg: number;
  description: string;
  loggedAt: string;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  participantCount: number;
  category: CarbonCategory;
  imageUrl?: string;
}

export interface GreenReward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  category: 'charge' | 'transit' | 'offset' | 'other';
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'purchase';
  points: number;
  description: string;
  createdAt: string;
}
