import { UsersRepository } from "../repositories/users-repository";
import type { User } from "../models/user";
import * as db from "../repositories/db";
import argon2 from "argon2";

jest.mock("../repositories/db");
jest.mock("argon2");

describe("UsersRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
    const mockInsert = db.insert as jest.MockedFunction<typeof db.insert>;
    const mockArgon2Hash = argon2.hash as jest.MockedFunction<typeof argon2.hash>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create a user with hashed password and return ID", async () => {
            const username = "testuser";
            const password = "password123";
            const hashedPassword = "$argon2id$v=19$m=65536,t=3,p=4$hash";
            const expectedId = 42;

            mockArgon2Hash.mockResolvedValue(hashedPassword);
            mockInsert.mockResolvedValue(expectedId);

            const result = await UsersRepository.create(username, password);

            expect(mockArgon2Hash).toHaveBeenCalledWith(password);
            expect(mockInsert).toHaveBeenCalledWith(
                "insert into users (username, password_hash) values (?, ?)",
                [username, hashedPassword],
            );
            expect(result).toBe(expectedId);
        });

        test("should handle password hashing errors", async () => {
            const username = "testuser";
            const password = "password123";

            mockArgon2Hash.mockRejectedValue(new Error("Hashing failed"));

            await expect(
                UsersRepository.create(username, password),
            ).rejects.toThrow("Hashing failed");
        });

        test("should handle database insert errors", async () => {
            const username = "testuser";
            const password = "password123";
            const hashedPassword = "$argon2id$v=19$m=65536,t=3,p=4$hash";

            mockArgon2Hash.mockResolvedValue(hashedPassword);
            mockInsert.mockRejectedValue(new Error("Duplicate username"));

            await expect(
                UsersRepository.create(username, password),
            ).rejects.toThrow("Duplicate username");
        });
    });

    describe("findById", () => {
        test("should find a user by ID", async () => {
            const mockUser: User = {
                id: 1,
                username: "testuser",
                password_hash: "$argon2id$hash",
                is_enabled: true,
                is_deleted: false,
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockUser]);

            const result = await UsersRepository.findById(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from users where id = ? limit 1",
                [1],
            );
            expect(result).toEqual(mockUser);
        });

        test("should return undefined when user not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await UsersRepository.findById(999);

            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            await expect(UsersRepository.findById(1)).rejects.toThrow(
                "Database error",
            );
        });
    });

    describe("findByUsername", () => {
        test("should find a user by username", async () => {
            const mockUser: User = {
                id: 1,
                username: "johnsmith",
                password_hash: "$argon2id$hash",
                is_enabled: true,
                is_deleted: false,
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockUser]);

            const result = await UsersRepository.findByUsername("johnsmith");

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from users where username = ? limit 1",
                ["johnsmith"],
            );
            expect(result).toEqual(mockUser);
        });

        test("should return null when user not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await UsersRepository.findByUsername("nonexistent");

            expect(result).toBeNull();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(
                UsersRepository.findByUsername("testuser"),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("list", () => {
        test("should return all users ordered by ID", async () => {
            const mockUsers: User[] = [
                {
                    id: 1,
                    username: "user1",
                    password_hash: "$hash1",
                    is_enabled: true,
                    is_deleted: false,
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    username: "user2",
                    password_hash: "$hash2",
                    is_enabled: false,
                    is_deleted: false,
                    created: new Date("2024-01-02"),
                    updated: new Date("2024-01-02"),
                },
                {
                    id: 3,
                    username: "user3",
                    password_hash: "$hash3",
                    is_enabled: true,
                    is_deleted: true,
                    created: new Date("2024-01-03"),
                    updated: new Date("2024-01-03"),
                },
            ];

            mockQuery.mockResolvedValue(mockUsers);

            const result = await UsersRepository.list();

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from users order by id",
                [],
            );
            expect(result).toEqual(mockUsers);
            expect(result).toHaveLength(3);
        });

        test("should return empty array when no users exist", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await UsersRepository.list();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Failed to fetch users"));

            await expect(UsersRepository.list()).rejects.toThrow(
                "Failed to fetch users",
            );
        });
    });

    describe("delete", () => {
        test("should delete a user by ID", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await UsersRepository.delete(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from users where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle deletion of non-existent user", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await UsersRepository.delete(999);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from users where id = ?",
                [999],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Delete failed"));

            await expect(UsersRepository.delete(1)).rejects.toThrow(
                "Delete failed",
            );
        });
    });
});
