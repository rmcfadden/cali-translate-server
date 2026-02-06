import { ApiKeysRepository } from "../repositories/api-keys-repository";
import type { ApiKey } from "../models/api-key";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("ApiKeysRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create an API key and return its ID", async () => {
            const newApiKey: Partial<ApiKey> = {
                user_id: 1,
                name: "test-api-key",
                secret: "secret123",
            };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: 42 } as ApiKey]);

            const result = await ApiKeysRepository.create(newApiKey);

            expect(mockQuery).toHaveBeenCalledWith(
                "insert into api_keys (user_id,name, secret) values (?, ?, ?)",
                [1, "test-api-key", "secret123"],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "select id from api_keys where name = ? limit 1",
                ["test-api-key"],
            );
            expect(result).toBe(42);
        });

        test("should handle database errors during insert", async () => {
            const newApiKey: Partial<ApiKey> = {
                user_id: 1,
                name: "test-api-key",
                secret: "secret123",
            };

            mockQuery.mockRejectedValue(new Error("Insert failed"));

            await expect(ApiKeysRepository.create(newApiKey)).rejects.toThrow(
                "Insert failed",
            );
        });
    });

    describe("findById", () => {
        test("should find an API key by ID", async () => {
            const mockApiKey: ApiKey = {
                id: 1,
                user_id: 5,
                name: "test-key",
                secret: "secret123",
                is_enabled: true,
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockApiKey]);

            const result = await ApiKeysRepository.findById(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from api_keys where id = ? limit 1",
                [1],
            );
            expect(result).toEqual(mockApiKey);
        });

        test("should return null when API key not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiKeysRepository.findById(999);

            expect(result).toBeNull();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            await expect(ApiKeysRepository.findById(1)).rejects.toThrow(
                "Database error",
            );
        });
    });

    describe("findByName", () => {
        test("should find an API key by name", async () => {
            const mockApiKey: ApiKey = {
                id: 1,
                user_id: 5,
                name: "production-key",
                secret: "secret123",
                is_enabled: true,
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockApiKey]);

            const result = await ApiKeysRepository.findByName("production-key");

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from api_keys where name = ? limit 1",
                ["production-key"],
            );
            expect(result).toEqual(mockApiKey);
        });

        test("should return null when API key not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result =
                await ApiKeysRepository.findByName("nonexistent-key");

            expect(result).toBeNull();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(
                ApiKeysRepository.findByName("test-key"),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("list", () => {
        test("should return all API keys ordered by ID", async () => {
            const mockApiKeys: ApiKey[] = [
                {
                    id: 1,
                    user_id: 1,
                    name: "key-1",
                    secret: "secret1",
                    is_enabled: true,
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    user_id: 2,
                    name: "key-2",
                    secret: "secret2",
                    is_enabled: false,
                    created: new Date("2024-01-02"),
                    updated: new Date("2024-01-02"),
                },
            ];

            mockQuery.mockResolvedValue(mockApiKeys);

            const result = await ApiKeysRepository.list();

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from api_keys order by id",
                [],
            );
            expect(result).toEqual(mockApiKeys);
            expect(result).toHaveLength(2);
        });

        test("should return empty array when no API keys exist", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiKeysRepository.list();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Failed to fetch keys"));

            await expect(ApiKeysRepository.list()).rejects.toThrow(
                "Failed to fetch keys",
            );
        });
    });

    describe("disable", () => {
        test("should disable an API key", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiKeysRepository.disable(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "update api_keys set is_enabled = false where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle disabling non-existent API key", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiKeysRepository.disable(999);

            expect(mockQuery).toHaveBeenCalledWith(
                "update api_keys set is_enabled = false where id = ?",
                [999],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Update failed"));

            await expect(ApiKeysRepository.disable(1)).rejects.toThrow(
                "Update failed",
            );
        });
    });
});
