import { query } from './db';
import type { User } from '../models/user';

export const UserRepository = {
  async create(username: string, passwordHash: string): Promise<number> {
    await query('insert into users (username, password_hash) values (?, ?)', [username, passwordHash]);
    const rows = await query<{ id: number }[]>('select id from users where username = ? limit 1', [username]);
    return rows[0].id;
  },

  async findById(id: number): Promise<User | null> {
    const rows = await query<User>('select * from users where id = ? limit 1', [id]);
    return rows[0] ?? null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const rows = await query<User>('select * from users where username = ? limit 1', [username]);
    return rows[0] ?? null;
  },

  async list(): Promise<User[]> {
    return query<User>('select * from users order by id', []);
  },

  async delete(id: number): Promise<void> {
    await query('delete from users where id = ?', [id]);
  },
};