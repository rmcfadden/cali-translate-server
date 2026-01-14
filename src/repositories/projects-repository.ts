import { query, insert } from "./db";
import type { Project } from "../models/project";

export const ProjectsRepository = {
    async create(name: string, isPublic?: boolean): Promise<number> {
        const result = await insert(
            "insert into projects (name, is_public) values (?, ?)",
            [name, isPublic ? 1 : 0],
        );
        return result;
    },

    async findById(id: number): Promise<Project | undefined> {
        const rows = await query<Project>(
            "select * from projects where id = ? limit 1",
            [id],
        );
        return rows[0] ?? undefined;
    },

    async findByName(name: string): Promise<Project | undefined> {
        const rows = await query<Project>(
            "select * from projects where name = ? limit 1",
            [name],
        );
        return rows[0] ?? undefined;
    },

    async list(): Promise<Project[]> {
        return query<Project>("select * from projects order by id", []);
    },

    async delete(id: number): Promise<void> {
        await query("delete from projects where id = ?", [id]);
    },
};
