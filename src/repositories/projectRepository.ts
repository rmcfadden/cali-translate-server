import { query } from './db';
import type { Project } from '../models/project';

export const ProjectRepository = {
  async create(name: string): Promise<number> {
    const result = await query<{ insertId: number }>('insert into projects (name) values (?)', [name]);
    // mysql2 returns result metadata differently via execute; lightweight cast:
    // if using pool.execute directly you'd get ResultSetHeader. For query helper we return rows,
    // so use another call to get last_insert_id if necessary. Keep minimal:
    const rows = await query<{ id: number }[]>('select id from projects where name = ? limit 1', [name]);
    return rows[0].id;
  },

  async findById(id: number): Promise<Project | null> {
    const rows = await query<Project>('select * from projects where id = ? limit 1', [id]);
    return rows[0] ?? null;
  },

  async list(): Promise<Project[]> {
    return query<Project>('select * from projects order by id', []);
  },

  async delete(id: number): Promise<void> {
    await query('delete from projects where id = ?', [id]);
  },
};