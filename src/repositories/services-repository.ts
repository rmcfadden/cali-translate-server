import { query, insert } from "./db";
import type { Service } from "../models/service";

export const ServicesRepository = {
    create: async (name: string): Promise<number> =>
        insert("insert into services (name) values (?)", [name]),

    findById: async (id: number): Promise<Service | undefined> =>
        (
            await query<Service>(
                "select * from services where id = ? limit 1",
                [id],
            )
        )[0] ?? undefined,

    findByName: async (name: string): Promise<Service | undefined> =>
        (
            await query<Service>(
                "select * from services where name = ? limit 1",
                [name],
            )
        )[0] ?? undefined,

    list: async (): Promise<Service[]> =>
        query<Service>("select * from services order by id", []),

    delete: async (id: number): Promise<void> =>
        void (await query("delete from services where id = ?", [id])),
};
