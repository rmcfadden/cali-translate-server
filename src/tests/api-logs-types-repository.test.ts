import { ApiLogsTypesRepository } from "../repositories/api-logs-types-repository";
import type { ApiLogType } from "../models/api-log-type";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("ApiLogsTypesRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("list", () => {
        test("should return all API log types", async () => {
            const mockLogTypes: ApiLogType[] = [
                {
                    id: 1,
                    name: "Start",
                    created: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    name: "Finish",
                    created: new Date("2024-01-01"),
                },
                {
                    id: 3,
                    name: "Error",
                    created: new Date("2024-01-01"),
                },
            ];

            mockQuery.mockResolvedValue(mockLogTypes);

            const result = await ApiLogsTypesRepository.list();

            expect(mockQuery).toHaveBeenCalledWith(
                "select id, name, created from api_log_types",
                [],
            );
            expect(result).toEqual(mockLogTypes);
            expect(result).toHaveLength(3);
        });

        test("should return empty array when no log types exist", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiLogsTypesRepository.list();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Failed to fetch log types"));

            await expect(ApiLogsTypesRepository.list()).rejects.toThrow(
                "Failed to fetch log types",
            );
        });
    });
});
