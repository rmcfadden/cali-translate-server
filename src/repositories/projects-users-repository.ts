import { insert, query } from "./db";
import type { ProjectsUser } from "../models/projects-user";

export const ProjectsUsersRepository = {
    async create(project_id: number, user_id: number): Promise<number> {
        return await insert(
            "insert into projects_users (project_id, user_id) values (?,?)",
            [project_id, user_id],
        );
    },

    async findById(id: number): Promise<ProjectsUser | undefined> {
        const rows = await query<ProjectsUser>(
            "select * from projects_users where id = ? limit 1",
            [id],
        );
        return rows[0] ?? undefined;
    },

    async findByProjectId(project_id: number): Promise<ProjectsUser[]> {
        const rows = await query<ProjectsUser>(
            "select * from projects_users where project_id = ?",
            [project_id],
        );
        return rows;
    },

    async findByProjectIdUserId(
        project_id: number,
        user_id: number,
    ): Promise<ProjectsUser | undefined> {
        const rows = await query<ProjectsUser>(
            "select * from projects_users where project_id = ? and user_id = ? limit 1",
            [project_id, user_id],
        );
        return rows[0] ?? undefined;
    },
};
