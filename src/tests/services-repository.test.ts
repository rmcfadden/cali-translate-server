import { ServicesRepository } from "../repositories/services-repository";
import type { Service } from "../models/service";
import * as db from "../repositories/db";

// Mock the db module
jest.mock("../repositories/db");

describe("ServicesRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
    const mockInsert = db.insert as jest.MockedFunction<typeof db.insert>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should insert a service and return the insert ID", async () => {
            const serviceName = "Translation Service";
            const expectedId = 123;

            mockInsert.mockResolvedValue(expectedId);

            const result = await ServicesRepository.create(serviceName);

            expect(mockInsert).toHaveBeenCalledWith(
                "insert into services (name) values (?)",
                [serviceName],
            );
            expect(result).toBe(expectedId);
        });

        test("should handle database errors", async () => {
            const serviceName = "Test Service";
            const error = new Error("Database error");

            mockInsert.mockRejectedValue(error);

            await expect(ServicesRepository.create(serviceName)).rejects.toThrow(
                "Database error",
            );
        });
    });

    describe("findById", () => {
        test("should find a service by ID", async () => {
            const mockService: Service = {
                id: 1,
                name: "Test Service",
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockService]);

            const result = await ServicesRepository.findById(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from services where id = ? limit 1",
                [1],
            );
            expect(result).toEqual(mockService);
        });

        test("should return undefined when service not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServicesRepository.findById(999);

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from services where id = ? limit 1",
                [999],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            const error = new Error("Database connection failed");

            mockQuery.mockRejectedValue(error);

            await expect(ServicesRepository.findById(1)).rejects.toThrow(
                "Database connection failed",
            );
        });
    });

    describe("findByName", () => {
        test("should find a service by name", async () => {
            const mockService: Service = {
                id: 1,
                name: "Translation Service",
                created: new Date("2024-01-01"),
                updated: new Date("2024-01-02"),
            };

            mockQuery.mockResolvedValue([mockService]);

            const result =
                await ServicesRepository.findByName("Translation Service");

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from services where name = ? limit 1",
                ["Translation Service"],
            );
            expect(result).toEqual(mockService);
        });

        test("should return undefined when service not found", async () => {
            mockQuery.mockResolvedValue([]);

            const result =
                await ServicesRepository.findByName("Nonexistent Service");

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from services where name = ? limit 1",
                ["Nonexistent Service"],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            const error = new Error("Query failed");

            mockQuery.mockRejectedValue(error);

            await expect(
                ServicesRepository.findByName("Test Service"),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("list", () => {
        test("should return all services ordered by id", async () => {
            const mockServices: Service[] = [
                {
                    id: 1,
                    name: "Service 1",
                    created: new Date("2024-01-01"),
                    updated: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    name: "Service 2",
                    created: new Date("2024-01-02"),
                    updated: new Date("2024-01-02"),
                },
                {
                    id: 3,
                    name: "Service 3",
                    created: new Date("2024-01-03"),
                    updated: new Date("2024-01-03"),
                },
            ];

            mockQuery.mockResolvedValue(mockServices);

            const result = await ServicesRepository.list();

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from services order by id",
                [],
            );
            expect(result).toEqual(mockServices);
            expect(result).toHaveLength(3);
        });

        test("should return empty array when no services exist", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServicesRepository.list();

            expect(mockQuery).toHaveBeenCalledWith(
                "select * from services order by id",
                [],
            );
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        test("should handle database errors", async () => {
            const error = new Error("Failed to fetch services");

            mockQuery.mockRejectedValue(error);

            await expect(ServicesRepository.list()).rejects.toThrow(
                "Failed to fetch services",
            );
        });
    });

    describe("delete", () => {
        test("should delete a service by ID", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServicesRepository.delete(1);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from services where id = ?",
                [1],
            );
            expect(result).toBeUndefined();
        });

        test("should handle deletion of non-existent service", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ServicesRepository.delete(999);

            expect(mockQuery).toHaveBeenCalledWith(
                "delete from services where id = ?",
                [999],
            );
            expect(result).toBeUndefined();
        });

        test("should handle database errors", async () => {
            const error = new Error("Delete operation failed");

            mockQuery.mockRejectedValue(error);

            await expect(ServicesRepository.delete(1)).rejects.toThrow(
                "Delete operation failed",
            );
        });
    });
});
