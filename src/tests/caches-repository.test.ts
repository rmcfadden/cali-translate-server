import { CachesRepository } from "../repositories/caches-repository";
import type { Cache } from "../models/cache";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("CachesRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should insert a new cache entry", async () => {
            const projectId = 1;
            const name = "translation:en:es:hello";
            const value = JSON.stringify({ translation: "hola" });

            mockQuery.mockResolvedValue([]);

            const result = await CachesRepository.create(
                projectId,
                name,
                value,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining(
                    "insert into caches (project_id, name, value) values (?, ?, ?)",
                ),
                [projectId, name, value],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("on duplicate key update"),
                [projectId, name, value],
            );
            expect(result).toBeUndefined();
        });

        test("should update existing cache entry on duplicate key", async () => {
            const projectId = 1;
            const name = "translation:en:es:hello";
            const value = JSON.stringify({ translation: "hola mundo" });

            mockQuery.mockResolvedValue([]);

            const result = await CachesRepository.create(
                projectId,
                name,
                value,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("on duplicate key update"),
                [projectId, name, value],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Insert failed"));

            await expect(
                CachesRepository.create(1, "key", "value"),
            ).rejects.toThrow("Insert failed");
        });
    });

    describe("get", () => {
        test("should retrieve a cache entry by project and name", async () => {
            const projectId = 1;
            const name = "translation:en:es:hello";
            const mockCache: Cache = {
                id: 1,
                project_id: projectId,
                name: name,
                value: JSON.stringify({ translation: "hola" }),
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockCache]);

            const result = await CachesRepository.get(projectId, name);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from caches where project_id = ? and name = ? limit 1",
                [projectId, name],
            );
            expect(result).toEqual(mockCache);
        });

        test("should return undefined when cache entry not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await CachesRepository.get(999, "nonexistent-key");

            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(CachesRepository.get(1, "key")).rejects.toThrow(
                "Query failed",
            );
        });
    });

    describe("delete", () => {
        test("should delete a cache entry by project and name", async () => {
            const projectId = 1;
            const name = "translation:en:es:hello";

            mockQuery.mockResolvedValue([]);

            const result = await CachesRepository.delete(projectId, name);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from caches where project_id = ? and name = ?",
                [projectId, name],
            );
            expect(result).toBeUndefined();
        });

        test("should handle deletion of non-existent cache entry", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await CachesRepository.delete(999, "nonexistent");

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from caches where project_id = ? and name = ?",
                [999, "nonexistent"],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Delete failed"));

            await expect(CachesRepository.delete(1, "key")).rejects.toThrow(
                "Delete failed",
            );
        });
    });
});
