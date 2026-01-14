import { query, insert } from "./db";
import type { Service } from "../models/service";

export const ServicesRepository = {
    async create(name: string): Promise<number> {
        const result = await insert("insert into services (name) values (?)", [
            name,
        ]);
        return result;
    },

    async findById(id: number): Promise<Service | undefined> {
        const rows = await query<Service>(
            "select * from services where id = ? limit 1",
            [id],
        );
        return rows[0] ?? undefined;
    },

    async findByName(name: string): Promise<Service | undefined> {
        const rows = await query<Service>(
            "select * from services where name = ? limit 1",
            [name],
        );
        return rows[0] ?? undefined;
    },

    async list(): Promise<Service[]> {
        return query<Service>("select * from services order by id", []);
    },

    async delete(id: number): Promise<void> {
        await query("delete from services where id = ?", [id]);
    },
};
