import { describe, it, expect } from 'vitest';
import { formatCarbon, formatPoints, formatDate } from '../../src/utils/format';

describe('format Helpers Utility', () => {
  describe('formatCarbon', () => {
    it('formats values less than 1000 in kg CO₂', () => {
      expect(formatCarbon(320.46)).toBe('320.5 kg CO₂');
      expect(formatCarbon(0)).toBe('0.0 kg CO₂');
    });

    it('formats values equal or greater than 1000 in tons CO₂', () => {
      expect(formatCarbon(1250)).toBe('1.25 tons CO₂');
      expect(formatCarbon(1000)).toBe('1.00 tons CO₂');
    });
  });

  describe('formatPoints', () => {
    it('formats numbers with thousands separators and Pts suffix', () => {
      expect(formatPoints(1200)).toBe('1,200 Pts');
      expect(formatPoints(50)).toBe('50 Pts');
    });
  });

  describe('formatDate', () => {
    it('correctly parses and formats ISO date strings', () => {
      const formatted = formatDate('2026-06-20T12:00:00Z');
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('20');
      expect(formatted).toContain('2026');
    });
  });
});
