import { ProjectSettingsRepository } from "../repositories/project-settings-repository";
import type { ProjectSetting } from "../models/project-setting";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("ProjectSettingsRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create a project setting and return its ID", async () => {
            const newSetting: Partial<ProjectSetting> = {
                project_id: 1,
                name: "cache_enabled",
                value: "true",
            };
            const expectedId = 42;

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: expectedId } as ProjectSetting]);

            const result = await ProjectSettingsRepository.create(newSetting);

            expect(mockQuery).toHaveBeenCalledWith(
                "insert into project_settings (project_id, name, value) values (?, ?, ?)",
                [1, "cache_enabled", "true"],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "select id from project_settings where project_id = ? and name = ? limit 1",
                [1, "cache_enabled"],
            );
            expect(result).toBe(expectedId);
        });

        test("should handle database errors", async () => {
            const newSetting: Partial<ProjectSetting> = {
                project_id: 1,
                name: "test",
                value: "value",
            };

            mockQuery.mockRejectedValue(new Error("Insert failed"));

            await expect(
                ProjectSettingsRepository.create(newSetting),
            ).rejects.toThrow("Insert failed");
        });
    });

    describe("findById", () => {
        test("should find a project setting by ID", async () => {
            const mockSetting: ProjectSetting = {
                id: 1,
                project_id: 5,
                name: "max_cache_size",
                value: "1000",
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockSetting]);

            const result = await ProjectSettingsRepository.findById(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from project_settings where id = ? limit 1",
                [1],
            );
            expect(result).toEqual(mockSetting);
        });

        test("should return null when setting not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectSettingsRepository.findById(999);

            expect(result).toBeNull();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            await expect(
                ProjectSettingsRepository.findById(1),
            ).rejects.toThrow("Database error");
        });
    });

    describe("findByProjectAndName", () => {
        test("should find a setting by project ID and name", async () => {
            const mockSetting: ProjectSetting = {
                id: 1,
                project_id: 5,
                name: "default_language",
                value: "en",
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockSetting]);

            const result =
                await ProjectSettingsRepository.findByProjectAndName(
                    5,
                    "default_language",
                );

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from project_settings where project_id = ? and name = ? limit 1",
                [5, "default_language"],
            );
            expect(result).toEqual(mockSetting);
        });

        test("should return null when setting not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result =
                await ProjectSettingsRepository.findByProjectAndName(
                    999,
                    "nonexistent",
                );

            expect(result).toBeNull();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(
                ProjectSettingsRepository.findByProjectAndName(1, "test"),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("listByProject", () => {
        test("should list all settings for a project", async () => {
            const mockSettings: ProjectSetting[] = [
                {
                    id: 1,
                    project_id: 5,
                    name: "cache_enabled",
                    value: "true",
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    project_id: 5,
                    name: "max_requests",
                    value: "1000",
                    created: new Date("2024-01-02"),
                    updated: new Date("2024-01-02"),
                },
            ];

            mockQuery.mockResolvedValue(mockSettings);

            const result = await ProjectSettingsRepository.listByProject(5);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from project_settings where project_id = ? order by value",
                [5],
            );
            expect(result).toEqual(mockSettings);
            expect(result).toHaveLength(2);
        });

        test("should return empty array when no settings found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectSettingsRepository.listByProject(999);

            expect(result).toEqual([]);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Failed to list settings"));

            await expect(
                ProjectSettingsRepository.listByProject(1),
            ).rejects.toThrow("Failed to list settings");
        });
    });

    describe("update", () => {
        test("should update a setting value", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectSettingsRepository.update(
                1,
                "updated_value",
            );

            expect(mockQuery).toHaveBeenCalledWith(
                "update project_settings set setting_value = ? where id = ?",
                ["updated_value", 1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Update failed"));

            await expect(
                ProjectSettingsRepository.update(1, "value"),
            ).rejects.toThrow("Update failed");
        });
    });

    describe("upsert", () => {
        test("should update existing setting", async () => {
            const existingSetting: ProjectSetting = {
                id: 1,
                project_id: 5,
                name: "cache_enabled",
                value: "false",
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery
                .mockResolvedValueOnce([existingSetting])
                .mockResolvedValueOnce([]);

            await ProjectSettingsRepository.upsert(5, "cache_enabled", "true");

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from project_settings where project_id = ? and name = ? limit 1",
                [5, "cache_enabled"],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "update project_settings set setting_value = ? where id = ?",
                ["true", 1],
            );
        });

        test("should create new setting when not found", async () => {
            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: 42 } as ProjectSetting]);

            await ProjectSettingsRepository.upsert(5, "new_setting", "value");

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from project_settings where project_id = ? and name = ? limit 1",
                [5, "new_setting"],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "insert into project_settings (project_id, name, value) values (?, ?, ?)",
                [5, "new_setting", "value"],
            );
        });
    });

    describe("delete", () => {
        test("should delete a setting by ID", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectSettingsRepository.delete(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from project_settings where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Delete failed"));

            await expect(ProjectSettingsRepository.delete(1)).rejects.toThrow(
                "Delete failed",
            );
        });
    });

    describe("deleteByProjectAndName", () => {
        test("should delete a setting by project ID and name", async () => {
            mockQuery.mockResolvedValue([]);

            const result =
                await ProjectSettingsRepository.deleteByProjectAndName(
                    5,
                    "cache_enabled",
                );

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from project_settings where project_id = ? and name = ?",
                [5, "cache_enabled"],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Delete failed"));

            await expect(
                ProjectSettingsRepository.deleteByProjectAndName(1, "test"),
            ).rejects.toThrow("Delete failed");
        });
    });
});
