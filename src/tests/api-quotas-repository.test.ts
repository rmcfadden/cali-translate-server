import { ApiQuotasRepository } from "../repositories/api-quotas-repository";
import type { ApiQuota } from "../models/api-quota";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("ApiQuotasRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create an API quota and return its ID", async () => {
            const newQuota: Partial<ApiQuota> = {
                api_key_id: 1,
                val: 100,
                interval_unit: "day",
                restrict_by_ip: true,
            };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: 42 } as ApiQuota]);

            const result = await ApiQuotasRepository.create(newQuota);

            expect(mockQuery).toHaveBeenCalledWith(
                "insert into api_quotas (api_key_id, val, interval_unit, restrict_by_ip) values (?, ?, ?, ?)",
                [1, 100, "day", 1],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "select id from api_quotas where api_key_id = ? limit 1",
                [1],
            );
            expect(result).toBe(42);
        });

        test("should create quota with restrict_by_ip false", async () => {
            const newQuota: Partial<ApiQuota> = {
                api_key_id: 2,
                val: 50,
                interval_unit: "hour",
                restrict_by_ip: false,
            };

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: 43 } as ApiQuota]);

            const result = await ApiQuotasRepository.create(newQuota);

            expect(mockQuery).toHaveBeenCalledWith(
                "insert into api_quotas (api_key_id, val, interval_unit, restrict_by_ip) values (?, ?, ?, ?)",
                [2, 50, "hour", 0],
            );
            expect(result).toBe(43);
        });

        test("should handle database errors", async () => {
            const newQuota: Partial<ApiQuota> = {
                api_key_id: 1,
                val: 100,
                interval_unit: "day",
            };

            mockQuery.mockRejectedValue(new Error("Insert failed"));

            await expect(ApiQuotasRepository.create(newQuota)).rejects.toThrow(
                "Insert failed",
            );
        });
    });

    describe("findById", () => {
        test("should find a quota by ID", async () => {
            const mockQuota: ApiQuota = {
                id: 1,
                api_key_id: 5,
                val: 100,
                interval_unit: "day",
                restrict_by_ip: true,
                is_enabled: true,
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockQuota]);

            const result = await ApiQuotasRepository.findById(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from api_quotas where id = ? limit 1",
                [1],
            );
            expect(result).toEqual(mockQuota);
        });

        test("should return null when quota not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiQuotasRepository.findById(999);

            expect(result).toBeNull();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            await expect(ApiQuotasRepository.findById(1)).rejects.toThrow(
                "Database error",
            );
        });
    });

    describe("findByApiKeyId", () => {
        test("should find all quotas for an API key", async () => {
            const mockQuotas: ApiQuota[] = [
                {
                    id: 1,
                    api_key_id: 5,
                    val: 100,
                    interval_unit: "day",
                    restrict_by_ip: true,
                    is_enabled: true,
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    api_key_id: 5,
                    val: 1000,
                    interval_unit: "month",
                    restrict_by_ip: false,
                    is_enabled: true,
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
            ];

            mockQuery.mockResolvedValue(mockQuotas);

            const result = await ApiQuotasRepository.findByApiKeyId(5);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from api_quotas where api_key_id = ?",
                [5],
            );
            expect(result).toEqual(mockQuotas);
            expect(result).toHaveLength(2);
        });

        test("should return empty array when no quotas found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiQuotasRepository.findByApiKeyId(999);

            expect(result).toEqual([]);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(
                ApiQuotasRepository.findByApiKeyId(1),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("listByApiKey", () => {
        test("should list quotas ordered by ID for an API key", async () => {
            const mockQuotas: ApiQuota[] = [
                {
                    id: 1,
                    api_key_id: 3,
                    val: 10,
                    interval_unit: "minute",
                    restrict_by_ip: false,
                    is_enabled: true,
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    api_key_id: 3,
                    val: 100,
                    interval_unit: "hour",
                    restrict_by_ip: true,
                    is_enabled: true,
                    created: new Date("2024-01-02"),
                    updated: new Date("2024-01-02"),
                },
            ];

            mockQuery.mockResolvedValue(mockQuotas);

            const result = await ApiQuotasRepository.listByApiKey(3);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from api_quotas where api_key_id = ? order by id",
                [3],
            );
            expect(result).toEqual(mockQuotas);
        });

        test("should return empty array when no quotas exist", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiQuotasRepository.listByApiKey(999);

            expect(result).toEqual([]);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Failed to list quotas"));

            await expect(ApiQuotasRepository.listByApiKey(1)).rejects.toThrow(
                "Failed to list quotas",
            );
        });
    });

    describe("update", () => {
        test("should update quota value and interval", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiQuotasRepository.update(1, 200, 3600);

            expect(mockQuery).toHaveBeenCalledWith(
                "update api_quotas set val = ?, interval_unit = ? where id = ?",
                [200, 3600, 1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Update failed"));

            await expect(
                ApiQuotasRepository.update(1, 100, 60),
            ).rejects.toThrow("Update failed");
        });
    });

    describe("disable", () => {
        test("should disable a quota", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiQuotasRepository.disable(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "update api_quotas set is_enabled = false where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Disable failed"));

            await expect(ApiQuotasRepository.disable(1)).rejects.toThrow(
                "Disable failed",
            );
        });
    });

    describe("enable", () => {
        test("should enable a quota", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiQuotasRepository.enable(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "update api_quotas set is_enabled = true where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Enable failed"));

            await expect(ApiQuotasRepository.enable(1)).rejects.toThrow(
                "Enable failed",
            );
        });
    });

    describe("delete", () => {
        test("should delete a quota", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiQuotasRepository.delete(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from api_quotas where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Delete failed"));

            await expect(ApiQuotasRepository.delete(1)).rejects.toThrow(
                "Delete failed",
            );
        });
    });
});
