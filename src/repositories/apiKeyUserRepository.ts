import { query } from './db';
import type { ApiKeyUser } from '../models/api-key-user';

export const ApiKeyUserRepository = {
  async assign(apiKeyId: number, userId: number): Promise<number> {
    await query('insert into api_keys_users (api_key_id, user_id) values (?, ?)', [apiKeyId, userId]);
    const rows = await query<ApiKeyUser>('select id from api_keys_users where api_key_id = ? and user_id = ? limit 1', [apiKeyId, userId]);
    return rows[0].id;
  },

  async listByApiKey(apiKeyId: number): Promise<ApiKeyUser[]> {
    return query<ApiKeyUser>('select * from api_keys_users where api_key_id = ? order by id', [apiKeyId]);
  },

  async remove(apiKeyId: number, userId: number): Promise<void> {
    await query('delete from api_keys_users where api_key_id = ? and user_id = ?', [apiKeyId, userId]);
  },
};