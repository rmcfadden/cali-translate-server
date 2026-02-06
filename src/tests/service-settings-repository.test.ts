import { ServiceSettingsRepository } from "../repositories/service-settings-repository";
import type { ServiceSetting } from "../models/service-setting";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("ServiceSettingsRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create a service setting and return its ID", async () => {
            const newSetting: Partial<ServiceSetting> = {
                service_id: 1,
                name: "api_endpoint",
                value: "https://api.example.com",
            };
            const expectedId = 42;

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: expectedId } as ServiceSetting]);

            const result = await ServiceSettingsRepository.create(newSetting);

            expect(mockQuery).toHaveBeenCalledWith(
                "insert into service_settings (service_id, name, value) values (?, ?, ?)",
                [1, "api_endpoint", "https://api.example.com"],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "select id from service_settings where service_id = ? and name = ? limit 1",
                [1, "api_endpoint"],
            );
            expect(result).toBe(expectedId);
        });

        test("should handle database errors", async () => {
            const newSetting: Partial<ServiceSetting> = {
                service_id: 1,
                name: "test",
                value: "value",
            };

            mockQuery.mockRejectedValue(new Error("Insert failed"));

            await expect(
                ServiceSettingsRepository.create(newSetting),
            ).rejects.toThrow("Insert failed");
        });
    });

    describe("findById", () => {
        test("should find a service setting by ID", async () => {
            const mockSetting: ServiceSetting = {
                id: 1,
                service_id: 5,
                name: "timeout",
                value: "30000",
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockSetting]);

            const result = await ServiceSettingsRepository.findById(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from service_settings where id = ? limit 1",
                [1],
            );
            expect(result).toEqual(mockSetting);
        });

        test("should return null when setting not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServiceSettingsRepository.findById(999);

            expect(result).toBeNull();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            await expect(ServiceSettingsRepository.findById(1)).rejects.toThrow(
                "Database error",
            );
        });
    });

    describe("findByServiceAndName", () => {
        test("should find a setting by service ID and name", async () => {
            const mockSetting: ServiceSetting = {
                id: 1,
                service_id: 5,
                name: "api_key",
                value: "secret123",
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockSetting]);

            const result = await ServiceSettingsRepository.findByServiceAndName(
                5,
                "api_key",
            );

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from service_settings where service_id = ? and name = ? limit 1",
                [5, "api_key"],
            );
            expect(result).toEqual(mockSetting);
        });

        test("should return null when setting not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServiceSettingsRepository.findByServiceAndName(
                999,
                "nonexistent",
            );

            expect(result).toBeNull();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(
                ServiceSettingsRepository.findByServiceAndName(1, "test"),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("listByService", () => {
        test("should list all settings for a service", async () => {
            const mockSettings: ServiceSetting[] = [
                {
                    id: 1,
                    service_id: 5,
                    name: "api_endpoint",
                    value: "https://api.example.com",
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    service_id: 5,
                    name: "timeout",
                    value: "30000",
                    created: new Date("2024-01-02"),
                    updated: new Date("2024-01-02"),
                },
            ];

            mockQuery.mockResolvedValue(mockSettings);

            const result = await ServiceSettingsRepository.listByService(5);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from service_settings where service_id = ? order by value",
                [5],
            );
            expect(result).toEqual(mockSettings);
            expect(result).toHaveLength(2);
        });

        test("should return empty array when no settings found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServiceSettingsRepository.listByService(999);

            expect(result).toEqual([]);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Failed to list settings"));

            await expect(
                ServiceSettingsRepository.listByService(1),
            ).rejects.toThrow("Failed to list settings");
        });
    });

    describe("update", () => {
        test("should update a setting value", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServiceSettingsRepository.update(
                1,
                "new_value",
            );

            expect(mockQuery).toHaveBeenCalledWith(
                "update service_settings set setting_value = ? where id = ?",
                ["new_value", 1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Update failed"));

            await expect(
                ServiceSettingsRepository.update(1, "value"),
            ).rejects.toThrow("Update failed");
        });
    });

    describe("upsert", () => {
        test("should update existing setting", async () => {
            const existingSetting: ServiceSetting = {
                id: 1,
                service_id: 5,
                name: "api_endpoint",
                value: "old_value",
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery
                .mockResolvedValueOnce([existingSetting])
                .mockResolvedValueOnce([]);

            await ServiceSettingsRepository.upsert(
                5,
                "api_endpoint",
                "new_value",
            );

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from service_settings where service_id = ? and name = ? limit 1",
                [5, "api_endpoint"],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "update service_settings set setting_value = ? where id = ?",
                ["new_value", 1],
            );
        });

        test("should create new setting when not found", async () => {
            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: 42 } as ServiceSetting]);

            await ServiceSettingsRepository.upsert(5, "new_setting", "value");

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from service_settings where service_id = ? and name = ? limit 1",
                [5, "new_setting"],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "insert into service_settings (service_id, name, value) values (?, ?, ?)",
                [5, "new_setting", "value"],
            );
        });
    });

    describe("delete", () => {
        test("should delete a setting by ID", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServiceSettingsRepository.delete(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from service_settings where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Delete failed"));

            await expect(ServiceSettingsRepository.delete(1)).rejects.toThrow(
                "Delete failed",
            );
        });
    });

    describe("deleteByServiceAndKey", () => {
        test("should delete a setting by service ID and name", async () => {
            mockQuery.mockResolvedValue([]);

            const result =
                await ServiceSettingsRepository.deleteByServiceAndKey(
                    5,
                    "api_endpoint",
                );

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from service_settings where service_id = ? and name = ?",
                [5, "api_endpoint"],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Delete failed"));

            await expect(
                ServiceSettingsRepository.deleteByServiceAndKey(1, "test"),
            ).rejects.toThrow("Delete failed");
        });
    });
});
