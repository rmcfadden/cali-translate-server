import { query } from './db';
import type { ApiKey } from '../models/apiKey';

export const ApiKeyRepository = {
  async create(name: string, secret: string): Promise<number> {
    await query('insert into api_keys (name, secret) values (?, ?)', [name, secret]);
    const rows = await query<{ id: number }[]>('select id from api_keys where name = ? limit 1', [name]);
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