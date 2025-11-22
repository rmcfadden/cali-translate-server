import { query } from './db';
import type { ApiLog } from '../models/api-log';

export const ApiLogRepository = {
  // store ip as varbinary(16) via INET6_ATON()
  async create(apiKeyId: number, ip: string, userId?: number): Promise<number> {
    await query('insert into api_logs (api_key_id, user_id, ip_address) values (?, ?, inet6_aton(?))', [
      apiKeyId,
      userId ?? null,
      ip,
    ]);
    const rows = await query<ApiLog>('select id from api_logs where api_key_id = ? order by id desc limit 1', [apiKeyId]);
    return rows[0].id;
  },

  // return human-readable IP (use INET6_NTOA())
  async listByApiKey(apiKeyId: number): Promise<ApiLog[]> {
    return query<ApiLog>('select id, api_key_id, user_id, inet6_ntoa(ip_address) as ip, created from api_logs where api_key_id = ? order by id', [apiKeyId]);
  },
};