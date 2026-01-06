import { query } from "./db";
import type { Cache } from "../models/cache";

export const CachesRepository = {
    async create(
        projectId: number,
        name: string,
        value: string,
    ): Promise<void> {
        // upsert style
        await query(
            `insert into caches (project_id, name, value) values (?, ?, ?)
       on duplicate key update value = values(value), updated = current_timestamp`,
            [projectId, name, value],
        );
    },

    async get(projectId: number, name: string): Promise<Cache | undefined> {
        const rows = await query<Cache>(
            "select * from caches where project_id = ? and name = ? limit 1",
            [projectId, name],
        );
        return rows[0] ?? undefined;
    },

    async delete(projectId: number, name: string): Promise<void> {
        await query("delete from caches where project_id = ? and name = ?", [
            projectId,
            name,
        ]);
    },
};
