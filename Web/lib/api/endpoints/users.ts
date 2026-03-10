import type { ApiClient } from '../base';
import type { User } from '@/lib/schemas';

export function createUsers(client: ApiClient) {
  return {
    me: () => client.get<User>('/api/v1/users/me'),
    update: (data: Partial<User>) => client.patch<User>('/api/v1/users/me', data),
  };
}
