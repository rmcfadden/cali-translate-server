import { query } from './db';
import type { Project } from '../models/project';

export const ProjectRepository = {
  async create(name: string): Promise<number> {
    const result = await query<Project>('insert into projects (name) values (?)', [name]);
    const rows = await query<Project>('select id from projects where name = ? limit 1', [name]);
    return rows[0].id;
  },

  async findById(id: number): Promise<Project | undefined> {
    const rows = await query<Project>('select * from projects where id = ? limit 1', [id]);
    return rows[0] ?? undefined;
  },

  async findByName(name: string): Promise<Project | undefined> {
    const rows = await query<Project>('select * from projects where name = ? limit 1', [name]);
    return rows[0] ?? undefined;
  },

  async list(): Promise<Project[]> {
    return query<Project>('select * from projects order by id', []);
  },

  async delete(id: number): Promise<void> {
    await query('delete from projects where id = ?', [id]);
  },
};