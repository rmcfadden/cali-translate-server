import { query } from "./db";
import type { ApiKeyHit } from "../models/api-key-hit";

export const ApiKeyHitsRepository = {
    // store ip as varbinary(16) via INET6_ATON()
    async create(apiKeyId: number, ip: string): Promise<number> {
        await query(
            "insert into api_key_hits (api_key_id, ip_address) values (?, inet6_aton(?))",
            [apiKeyId, ip],
        );
        const rows = await query<ApiKeyHit>(
            "select id from api_key_hits where api_key_id = ? order by id desc limit 1",
            [apiKeyId],
        );
        return rows[0].id;
    },

    // return human-readable IP (use INET6_NTOA())
    async listByApiKey(apiKeyId: number): Promise<ApiKeyHit[]> {
        return query<ApiKeyHit>(
            "select id, api_key_id, user_id, inet6_ntoa(ip_address) as ip, created from api_key_hits where api_key_id = ? order by id",
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
      FROM api_key_hits 
      WHERE api_key_id = ? 
      AND created >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? ${intervalUnit.toUpperCase()})`,
            [apiKeyId, interval],
        );
        return rows[0].count;
    },

    async getCountByIntervalIPAddress(
        apiKeyId: number,
        intervalUnit: string,
        interval: number,
        ipAddress: string,
    ): Promise<number> {
        const rows = await query<{ count: number }>(
            `
      SELECT COALESCE(COUNT(id), 0) as count 
      FROM api_key_hits 
      WHERE api_key_id = ?
      AND ip_address = INET6_ATON(?)  
      AND created >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? ${intervalUnit.toUpperCase()})`,
            [apiKeyId, ipAddress, interval],
        );
        return rows[0].count;
    },
};
