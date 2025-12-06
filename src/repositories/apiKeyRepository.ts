import { query } from './db';
import { ApiKey } from '../models/api-key';

export const ApiKeyRepository = {
  async create(apiKey: Partial<ApiKey>): Promise<number> {
    const { user_id, name, secret } = apiKey;
    await query('insert into api_keys (user_id,name, secret) values (?, ?, ?)', [user_id, name, secret]);
    const rows = await query<ApiKey>('select id from api_keys where name = ? limit 1', [name]);
    return rows[0].id;
  },

  async findById(id: number): Promise<ApiKey | null> {
    const rows = await query<ApiKey>('select * from api_keys where id = ? limit 1', [id]);
    return rows[0] ?? null;
  },

  async findByName(name: string): Promise<ApiKey | null> {
    const rows = await query<ApiKey>('select * from api_keys where name = ? limit 1', [name]);
    return rows[0] ?? null;
  },

  async list(): Promise<ApiKey[]> {
    return query<ApiKey>('select * from api_keys order by id', []);
  },

  async disable(id: number): Promise<void> {
    await query('update api_keys set is_enabled = false where id = ?', [id]);
  },
};