import { describe, it, expect, vi, beforeEach } from 'vitest';
import aiService from '../../src/services/ai';

describe('AIService Client API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends coaching message and handles standard json response', async () => {
    const mockResponse = {
      role: 'model',
      content: 'Mocked Advice: Conserve 5kWh today!'
    };

    // Mock global fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await aiService.sendMessageToCoach('How to reduce carbon?');
    expect(result.role).toBe('model');
    expect(result.content).toContain('Mocked Advice');
  });

  it('triggers local mock fallback advice when API is offline', async () => {
    // Mock fetch error
    (global.fetch as any).mockRejectedValue(new Error('Network offline'));

    const result = await aiService.sendMessageToCoach('How to reduce carbon?');
    expect(result.role).toBe('model');
    expect(result.content).toContain('sustainability quest');
  });
});
