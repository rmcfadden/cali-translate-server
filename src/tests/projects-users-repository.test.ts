import { ProjectsUsersRepository } from "../repositories/projects-users-repository";
import type { ProjectsUser } from "../models/projects-user";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("ProjectsUsersRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
    const mockInsert = db.insert as jest.MockedFunction<typeof db.insert>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create a project-user association and return ID", async () => {
            const projectId = 1;
            const userId = 5;
            const expectedId = 42;

            mockInsert.mockResolvedValue(expectedId);

            const result = await ProjectsUsersRepository.create(
                projectId,
                userId,
            );

            expect(mockInsert).toHaveBeenCalledWith(
                "insert into projects_users (project_id, user_id) values (?,?)",
                [projectId, userId],
            );
            expect(result).toBe(expectedId);
        });

        test("should handle database errors", async () => {
            mockInsert.mockRejectedValue(new Error("Foreign key constraint"));

            await expect(
                ProjectsUsersRepository.create(1, 999),
            ).rejects.toThrow("Foreign key constraint");
        });
    });

    describe("findById", () => {
        test("should find a project-user association by ID", async () => {
            const mockProjectUser: ProjectsUser = {
                id: 1,
                project_id: 5,
                user_id: 10,
                created: new Date("2024-01-01"),
            };

            mockQuery.mockResolvedValue([mockProjectUser]);

            const result = await ProjectsUsersRepository.findById(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from projects_users where id = ? limit 1",
                [1],
            );
            expect(result).toEqual(mockProjectUser);
        });

        test("should return undefined when not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectsUsersRepository.findById(999);

            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            await expect(ProjectsUsersRepository.findById(1)).rejects.toThrow(
                "Database error",
            );
        });
    });

    describe("findByProjectId", () => {
        test("should find all users for a project", async () => {
            const mockProjectUsers: ProjectsUser[] = [
                {
                    id: 1,
                    project_id: 5,
                    user_id: 10,
                    created: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    project_id: 5,
                    user_id: 20,
                    created: new Date("2024-01-02"),
                },
                {
                    id: 3,
                    project_id: 5,
                    user_id: 30,
                    created: new Date("2024-01-03"),
                },
            ];

            mockQuery.mockResolvedValue(mockProjectUsers);

            const result = await ProjectsUsersRepository.findByProjectId(5);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from projects_users where project_id = ?",
                [5],
            );
            expect(result).toEqual(mockProjectUsers);
            expect(result).toHaveLength(3);
        });

        test("should return empty array when no users found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectsUsersRepository.findByProjectId(999);

            expect(result).toEqual([]);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(
                ProjectsUsersRepository.findByProjectId(1),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("findByProjectIdUserId", () => {
        test("should find a specific project-user association", async () => {
            const mockProjectUser: ProjectsUser = {
                id: 1,
                project_id: 5,
                user_id: 10,
                created: new Date("2024-01-01"),
            };

            mockQuery.mockResolvedValue([mockProjectUser]);

            const result = await ProjectsUsersRepository.findByProjectIdUserId(
                5,
                10,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from projects_users where project_id = ? and user_id = ? limit 1",
                [5, 10],
            );
            expect(result).toEqual(mockProjectUser);
        });

        test("should return undefined when association not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ProjectsUsersRepository.findByProjectIdUserId(
                999,
                888,
            );

            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            await expect(
                ProjectsUsersRepository.findByProjectIdUserId(1, 1),
            ).rejects.toThrow("Database error");
        });
    });
});
