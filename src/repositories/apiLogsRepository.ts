import { query } from "./db";
import type { ApiLog } from "../models/api-log";

export const ApiLogsRepository = {
    // store ip as varbinary(16) via INET6_ATON()
    async create(
        apiKeyId: number,
        ip: string,
        cost: number = 0,
        currencyCode: string = "usd",
        isSuccess: boolean = true,
    ): Promise<number> {
        await query(
            "insert into api_logs (api_key_id, ip_address, cost, currency_code, is_success) values (?, inet6_aton(?), ?, ?, ?)",
            [apiKeyId, ip, cost, currencyCode, isSuccess],
        );
        const rows = await query<ApiLog>(
            "select id from api_logs where api_key_id = ? order by id desc limit 1",
            [apiKeyId],
        );
        return rows[0].id;
    },

    // return human-readable IP (use INET6_NTOA())
    async listByApiKey(apiKeyId: number): Promise<ApiLog[]> {
        return query<ApiLog>(
            "select id, api_key_id, user_id, inet6_ntoa(ip_address) as ip, created from api_logs where api_key_id = ? order by id",
            [apiKeyId],
        );
    },

    async getCountByInterval(
        apiKeyId: number,
        intervalUnit: string,
        interval: number,
    ): Promise<number> {
        const rows = await query<{ count: number }>(
            `
      SELECT COALESCE(COUNT(id), 0) as count 
      FROM api_logs 
      WHERE api_key_id = ? 
      AND created >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? ${intervalUnit.toUpperCase()})`,
            [apiKeyId, interval],
        );
        return rows[0].count;
    },
};
