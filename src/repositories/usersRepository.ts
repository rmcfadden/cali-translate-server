import { query } from "./db";
import argon2 from "argon2";
import type { User } from "../models/user";

export const UsersRepository = {
    async create(username: string, password: string): Promise<number> {
        const hash = await argon2.hash(password);
        await query(
            "insert into users (username, password_hash) values (?, ?)",
            [username, hash],
        );
        const rows = await query<User>(
            "select id from users where username = ? limit 1",
            [username],
        );
        return rows[0].id;
    },

    async findById(id: number): Promise<User | undefined> {
        const rows = await query<User>(
            "select * from users where id = ? limit 1",
            [id],
        );
        return rows[0] ?? undefined;
    },

    async findByUsername(username: string): Promise<User | undefined> {
        const rows = await query<User>(
            "select * from users where username = ? limit 1",
            [username],
        );
        return rows[0] ?? null;
    },

    async list(): Promise<User[]> {
        return query<User>("select * from users order by id", []);
    },

    async delete(id: number): Promise<void> {
        await query("delete from users where id = ?", [id]);
    },
};
