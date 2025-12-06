import { query } from './db';
import type { ApiQuota } from '../models/api-quota';

export const ApiQuotaRepository = {
  async create(apiQuota: Partial<ApiQuota>): Promise<number> {
    const { user_id, project_id, quota_limit, quota_used } = apiQuota;
    await query(
      'insert into api_quotas (user_id, project_id, quota_limit, quota_used) values (?, ?, ?, ?)',
      [user_id, project_id, quota_limit, quota_used]
    );
    const rows = await query<ApiQuota>(
      'select id from api_quotas where user_id = ? and project_id = ? limit 1',
      [user_id, project_id]
    );
    return rows[0].id;
  },

  async findById(id: number): Promise<ApiQuota | null> {
    const rows = await query<ApiQuota>('select * from api_quotas where id = ? limit 1', [id]);
    return rows[0] ?? null;
  },

  async findByUserAndProject(user_id: number, project_id: number): Promise<ApiQuota | null> {
    const rows = await query<ApiQuota>(
      'select * from api_quotas where user_id = ? and project_id = ? limit 1',
      [user_id, project_id]
    );
    return rows[0] ?? null;
  },

  async listByUser(user_id: number): Promise<ApiQuota[]> {
    return query<ApiQuota>('select * from api_quotas where user_id = ? order by id', [user_id]);
  },

  async updateQuotaUsed(id: number, quota_used: number): Promise<void> {
    await query('update api_quotas set quota_used = ? where id = ?', [quota_used, id]);
  },

  async incrementQuotaUsed(id: number, increment: number = 1): Promise<void> {
    await query('update api_quotas set quota_used = quota_used + ? where id = ?', [increment, id]);
  },

  async resetQuota(id: number, reset_at: Date): Promise<void> {
    await query('update api_quotas set quota_used = 0, reset_at = ? where id = ?', [reset_at, id]);
  },

  async delete(id: number): Promise<void> {
    await query('delete from api_quotas where id = ?', [id]);
  },
};
