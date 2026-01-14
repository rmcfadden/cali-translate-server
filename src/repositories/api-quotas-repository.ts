import { query } from "./db";
import type { ApiQuota } from "../models/api-quota";

export const ApiQuotasRepository = {
    async create(apiQuota: Partial<ApiQuota>): Promise<number> {
        const { api_key_id, val, interval_unit, restrict_by_ip } = apiQuota;
        await query(
            "insert into api_quotas (api_key_id, val, interval_unit, restrict_by_ip) values (?, ?, ?, ?)",
            [api_key_id, val, interval_unit, restrict_by_ip ? 1 : 0],
        );
        const rows = await query<ApiQuota>(
            "select id from api_quotas where api_key_id = ? limit 1",
            [api_key_id],
        );
        return rows[0].id;
    },

    async findById(id: number): Promise<ApiQuota | null> {
        const rows = await query<ApiQuota>(
            "select * from api_quotas where id = ? limit 1",
            [id],
        );
        return rows[0] ?? null;
    },

    async findByApiKeyId(api_key_id: number): Promise<ApiQuota[]> {
        const rows = await query<ApiQuota>(
            "select * from api_quotas where api_key_id = ?",
            [api_key_id],
        );
        return rows;
    },

    async listByApiKey(api_key_id: number): Promise<ApiQuota[]> {
        return query<ApiQuota>(
            "select * from api_quotas where api_key_id = ? order by id",
            [api_key_id],
        );
    },

    async update(
        id: number,
        val: number,
        interval_unit: number,
    ): Promise<void> {
        await query(
            "update api_quotas set val = ?, interval_unit = ? where id = ?",
            [val, interval_unit, id],
        );
    },

    async disable(id: number): Promise<void> {
        await query("update api_quotas set is_enabled = false where id = ?", [
            id,
        ]);
    },

    async enable(id: number): Promise<void> {
        await query("update api_quotas set is_enabled = true where id = ?", [
            id,
        ]);
    },

    async delete(id: number): Promise<void> {
        await query("delete from api_quotas where id = ?", [id]);
    },
};
