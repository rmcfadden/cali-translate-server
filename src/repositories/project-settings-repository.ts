import { query } from "./db";
import type { ProjectSetting } from "../models/project-setting";

export const ProjectSettingsRepository = {
    async create(projectSetting: Partial<ProjectSetting>): Promise<number> {
        const { project_id, name, value } = projectSetting;
        await query(
            "insert into project_settings (project_id, name, value) values (?, ?, ?)",
            [project_id, name, value],
        );
        const rows = await query<ProjectSetting>(
            "select id from project_settings where project_id = ? and name = ? limit 1",
            [project_id, name],
        );
        return rows[0].id;
    },

    async findById(id: number): Promise<ProjectSetting | null> {
        const rows = await query<ProjectSetting>(
            "select * from project_settings where id = ? limit 1",
            [id],
        );
        return rows[0] ?? null;
    },

    async findByProjectAndName(
        project_id: number,
        name: string,
    ): Promise<ProjectSetting | null> {
        const rows = await query<ProjectSetting>(
            "select * from project_settings where project_id = ? and name = ? limit 1",
            [project_id, name],
        );
        return rows[0] ?? null;
    },

    async listByProject(project_id: number): Promise<ProjectSetting[]> {
        return query<ProjectSetting>(
            "select * from project_settings where project_id = ? order by value",
            [project_id],
        );
    },

    async update(id: number, setting_value: string): Promise<void> {
        await query(
            "update project_settings set setting_value = ? where id = ?",
            [setting_value, id],
        );
    },

    async upsert(
        project_id: number,
        name: string,
        value: string,
    ): Promise<void> {
        const existing = await this.findByProjectAndKey(project_id, name);
        if (existing) {
            await this.update(existing.id, value);
        } else {
            await this.create({ project_id, name, value });
        }
    },

    async delete(id: number): Promise<void> {
        await query("delete from project_settings where id = ?", [id]);
    },

    async deleteByProjectAndName(
        project_id: number,
        name: string,
    ): Promise<void> {
        await query(
            "delete from project_settings where project_id = ? and name = ?",
            [project_id, name],
        );
    },
};
