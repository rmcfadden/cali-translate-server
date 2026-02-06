import { ProjectsRepository } from "../repositories/projects-repository";
import type { Project } from "../models/project";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("ProjectsRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
    const mockInsert = db.insert as jest.MockedFunction<typeof db.insert>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create a public project and return its ID", async () => {
            const projectName = "Public Project";
            const expectedId = 42;

            mockInsert.mockResolvedValue(expectedId);

            const result = await ProjectsRepository.create(projectName, true);

            expect(mockInsert).toHaveBeenCalledWith(
                "insert into projects (name, is_public) values (?, ?)",
                [projectName, 1],
            );
            expect(result).toBe(expectedId);
        });

        test("should create a private project when isPublic is false", async () => {
            const projectName = "Private Project";
            const expectedId = 43;

            mockInsert.mockResolvedValue(expectedId);

            const result = await ProjectsRepository.create(projectName, false);

            expect(mockInsert).toHaveBeenCalledWith(
                "insert into projects (name, is_public) values (?, ?)",
                [projectName, 0],
            );
            expect(result).toBe(expectedId);
        });

        test("should default to private when isPublic is undefined", async () => {
            const projectName = "Default Project";
            const expectedId = 44;

            mockInsert.mockResolvedValue(expectedId);

            const result = await ProjectsRepository.create(projectName);

            expect(mockInsert).toHaveBeenCalledWith(
                "insert into projects (name, is_public) values (?, ?)",
                [projectName, 0],
            );
            expect(result).toBe(expectedId);
        });

        test("should handle database errors", async () => {
            mockInsert.mockRejectedValue(new Error("Duplicate project name"));

            await expect(
                ProjectsRepository.create("Test Project"),
            ).rejects.toThrow("Duplicate project name");
        });
    });

    describe("findById", () => {
        test("should find a project by ID", async () => {
            const mockProject: Project = {
                id: 1,
                name: "Test Project",
                is_public: true,
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockProject]);

            const result = await ProjectsRepository.findById(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from projects where id = ? limit 1",
                [1],
            );
            expect(result).toEqual(mockProject);
        });

        test("should return undefined when project not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectsRepository.findById(999);

            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            await expect(ProjectsRepository.findById(1)).rejects.toThrow(
                "Database error",
            );
        });
    });

    describe("findByName", () => {
        test("should find a project by name", async () => {
            const mockProject: Project = {
                id: 1,
                name: "Production",
                is_public: false,
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockProject]);

            const result = await ProjectsRepository.findByName("Production");

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from projects where name = ? limit 1",
                ["Production"],
            );
            expect(result).toEqual(mockProject);
        });

        test("should return undefined when project not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result =
                await ProjectsRepository.findByName("Nonexistent Project");

            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(
                ProjectsRepository.findByName("Test"),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("list", () => {
        test("should return all projects ordered by ID", async () => {
            const mockProjects: Project[] = [
                {
                    id: 1,
                    name: "Project 1",
                    is_public: true,
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    name: "Project 2",
                    is_public: false,
                    created: new Date("2024-01-02"),
                    updated: new Date("2024-01-02"),
                },
                {
                    id: 3,
                    name: "Project 3",
                    is_public: true,
                    created: new Date("2024-01-03"),
                    updated: new Date("2024-01-03"),
                },
            ];

            mockQuery.mockResolvedValue(mockProjects);

            const result = await ProjectsRepository.list();

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from projects order by id",
                [],
            );
            expect(result).toEqual(mockProjects);
            expect(result).toHaveLength(3);
        });

        test("should return empty array when no projects exist", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectsRepository.list();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Failed to fetch projects"));

            await expect(ProjectsRepository.list()).rejects.toThrow(
                "Failed to fetch projects",
            );
        });
    });

    describe("delete", () => {
        test("should delete a project by ID", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectsRepository.delete(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from projects where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle deletion of non-existent project", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectsRepository.delete(999);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from projects where id = ?",
                [999],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Delete failed"));

            await expect(ProjectsRepository.delete(1)).rejects.toThrow(
                "Delete failed",
            );
        });
    });
});
