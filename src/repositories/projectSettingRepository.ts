import { query } from './db';
import type { ProjectSetting } from '../models/project-setting';

export const ProjectSettingRepository = {
  async create(projectSetting: Partial<ProjectSetting>): Promise<number> {
    const { project_id, setting_key, setting_value } = projectSetting;
    await query(
      'insert into project_settings (project_id, setting_key, setting_value) values (?, ?, ?)',
      [project_id, setting_key, setting_value]
    );
    const rows = await query<ProjectSetting>(
      'select id from project_settings where project_id = ? and setting_key = ? limit 1',
      [project_id, setting_key]
    );
    return rows[0].id;
  },

  async findById(id: number): Promise<ProjectSetting | null> {
    const rows = await query<ProjectSetting>('select * from project_settings where id = ? limit 1', [id]);
    return rows[0] ?? null;
  },

  async findByProjectAndKey(project_id: number, setting_key: string): Promise<ProjectSetting | null> {
    const rows = await query<ProjectSetting>(
      'select * from project_settings where project_id = ? and setting_key = ? limit 1',
      [project_id, setting_key]
    );
    return rows[0] ?? null;
  },

  async listByProject(project_id: number): Promise<ProjectSetting[]> {
    return query<ProjectSetting>('select * from project_settings where project_id = ? order by setting_key', [project_id]);
  },

  async update(id: number, setting_value: string): Promise<void> {
    await query('update project_settings set setting_value = ? where id = ?', [setting_value, id]);
  },

  async upsert(project_id: number, setting_key: string, setting_value: string): Promise<void> {
    const existing = await this.findByProjectAndKey(project_id, setting_key);
    if (existing) {
      await this.update(existing.id, setting_value);
    } else {
      await this.create({ project_id, setting_key, setting_value });
    }
  },

  async delete(id: number): Promise<void> {
    await query('delete from project_settings where id = ?', [id]);
  },

  async deleteByProjectAndKey(project_id: number, setting_key: string): Promise<void> {
    await query('delete from project_settings where project_id = ? and setting_key = ?', [project_id, setting_key]);
  },
};
