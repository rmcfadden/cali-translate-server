import { query } from "./db";
import type { ApiLog } from "../models/api-log";
import { ApiLogsTypesRepository } from "./api-logs-types-repository";

export const ApiLogsRepository = {
    async create(
        apiKeyId: number,
        logTypeName: string,
        ip: string,
        cost: number = 0,
        currencyCode: string = "usd",
        isSuccess: boolean = false,
    ): Promise<number> {
        const { list } = ApiLogsTypesRepository;
        const apiLogTypes = await list();
        const logType = apiLogTypes.find(
            (type) => type.name.toLowerCase() === logTypeName.toLowerCase(),
        );
        if (!logType) throw new Error(`Invalid log type name: ${logTypeName}`);
        await query(
            "insert into api_logs (api_key_id, log_type_id, ip_address, cost, currency_code, is_success) values (?, ?, inet6_aton(?), ?, ?, ?)",
            [apiKeyId, logType.id, ip, cost, currencyCode, isSuccess],
        );
        const rows = await query<ApiLog>(
            "select id from api_logs where api_key_id = ? order by id desc limit 1",
            [apiKeyId],
        );
        return rows[0].id;
    },

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
