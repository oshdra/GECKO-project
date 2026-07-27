import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchSimulators,
  fetchSimulator,
  fetchSettings,
  updateSettings,
  getSimulatorHtmlUrl,
} from './client';

describe('API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetchSimulators calls /api/simulators endpoint', async () => {
    const mockData = [
      {
        id: 'finite-speed-gravity',
        name: 'Finite Speed of Gravity',
        domain: 'physics',
        tags: ['physics', 'gravity'],
        versions: [1],
        latest_version: 1,
        last_modified: '2026-07-27',
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchSimulators();
    expect(global.fetch).toHaveBeenCalledWith('/api/simulators');
    expect(result).toEqual(mockData);
  });

  it('fetchSimulator calls /api/simulators/{id} endpoint', async () => {
    const mockDetail = {
      id: 'finite-speed-gravity',
      name: 'Finite Speed of Gravity',
      domain: 'physics',
      tags: ['physics'],
      versions: [1],
      latest_version: 1,
      last_modified: '2026-07-27',
      spec: {
        name: 'Finite Speed of Gravity',
        version: 1,
        created: '2026-01-15',
        modified: '2026-07-27',
        tags: ['physics'],
        agents: [],
        environment: { type: '3D', physics: 'gravity', attributes: [] },
        interactions: [],
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDetail,
    });

    const result = await fetchSimulator('finite-speed-gravity');
    expect(global.fetch).toHaveBeenCalledWith('/api/simulators/finite-speed-gravity');
    expect(result).toEqual(mockDetail);
  });

  it('fetchSettings calls /api/settings endpoint', async () => {
    const mockSettings = { gemini_api_key: 'AIzaSyTestKey' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSettings,
    });

    const result = await fetchSettings();
    expect(global.fetch).toHaveBeenCalledWith('/api/settings');
    expect(result).toEqual(mockSettings);
  });

  it('updateSettings sends POST request to /api/settings', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });

    const result = await updateSettings({ gemini_api_key: 'new-key' });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/settings',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemini_api_key: 'new-key' }),
      })
    );
    expect(result).toEqual({ status: 'ok' });
  });

  it('getSimulatorHtmlUrl returns formatted static HTML path', () => {
    const url = getSimulatorHtmlUrl('finite-speed-gravity', 1);
    expect(url).toBe('/api/simulators/finite-speed-gravity/html/1');
  });
});
