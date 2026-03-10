import type { ApiClient } from '../base';

export function createHealth(client: ApiClient) {
  return {
    health: () => client.get<{ status: string; version: string }>('/api/health'),
  };
}
