import { ApiLogsRepository } from "../repositories/api-logs-repository";
import type { ApiLog } from "../models/api-log";
import type { ApiLogType } from "../models/api-log-type";
import * as db from "../repositories/db";
import { ApiLogsTypesRepository } from "../repositories/api-logs-types-repository";

jest.mock("../repositories/db");
jest.mock("../repositories/api-logs-types-repository");

describe("ApiLogsRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
    const mockApiLogsTypesList =
        ApiLogsTypesRepository.list as jest.MockedFunction<
            typeof ApiLogsTypesRepository.list
        >;

    const mockLogTypes: ApiLogType[] = [
        { id: 1, name: "Start", created: new Date("2024-01-01") },
        { id: 2, name: "Finish", created: new Date("2024-01-01") },
        { id: 3, name: "Error", created: new Date("2024-01-01") },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockApiLogsTypesList.mockResolvedValue(mockLogTypes);
    });

    describe("create", () => {
        test("should create an API log with default values", async () => {
            const apiKeyId = 1;
            const logTypeName = "Start";
            const ip = "192.168.1.1";
            const expectedId = 42;

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: expectedId } as ApiLog]);

            const result = await ApiLogsRepository.create(
                apiKeyId,
                logTypeName,
                ip,
            );

            expect(mockApiLogsTypesList).toHaveBeenCalled();
            expect(mockQuery).toHaveBeenCalledWith(
                "insert into api_logs (api_key_id, log_type_id, ip_address, cost, currency_code, is_success) values (?, ?, inet6_aton(?), ?, ?, ?)",
                [apiKeyId, 1, ip, 0, "usd", false],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "select id from api_logs where api_key_id = ? order by id desc limit 1",
                [apiKeyId],
            );
            expect(result).toBe(expectedId);
        });

        test("should create an API log with custom values", async () => {
            const apiKeyId = 2;
            const logTypeName = "Finish";
            const ip = "10.0.0.1";
            const cost = 0.05;
            const currencyCode = "eur";
            const isSuccess = true;
            const expectedId = 43;

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: expectedId } as ApiLog]);

            const result = await ApiLogsRepository.create(
                apiKeyId,
                logTypeName,
                ip,
                cost,
                currencyCode,
                isSuccess,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                "insert into api_logs (api_key_id, log_type_id, ip_address, cost, currency_code, is_success) values (?, ?, inet6_aton(?), ?, ?, ?)",
                [apiKeyId, 2, ip, cost, currencyCode, isSuccess],
            );
            expect(result).toBe(expectedId);
        });

        test("should handle case-insensitive log type names", async () => {
            const apiKeyId = 1;
            const logTypeName = "error";
            const ip = "192.168.1.1";
            const expectedId = 44;

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: expectedId } as ApiLog]);

            const result = await ApiLogsRepository.create(
                apiKeyId,
                logTypeName,
                ip,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("insert into api_logs"),
                [apiKeyId, 3, ip, 0, "usd", false],
            );
            expect(result).toBe(expectedId);
        });

        test("should throw error for invalid log type name", async () => {
            const apiKeyId = 1;
            const logTypeName = "InvalidType";
            const ip = "192.168.1.1";

            await expect(
                ApiLogsRepository.create(apiKeyId, logTypeName, ip),
            ).rejects.toThrow("Invalid log type name: InvalidType");
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Insert failed"));

            await expect(
                ApiLogsRepository.create(1, "Start", "192.168.1.1"),
            ).rejects.toThrow("Insert failed");
        });

        test("should handle IPv6 addresses", async () => {
            const apiKeyId = 1;
            const logTypeName = "Start";
            const ip = "2001:0db8:85a3::8a2e:0370:7334";
            const expectedId = 45;

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: expectedId } as ApiLog]);

            const result = await ApiLogsRepository.create(
                apiKeyId,
                logTypeName,
                ip,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("inet6_aton(?)"),
                [apiKeyId, 1, ip, 0, "usd", false],
            );
            expect(result).toBe(expectedId);
        });
    });

    describe("listByApiKey", () => {
        test("should list all logs for an API key", async () => {
            const apiKeyId = 1;
            const mockLogs: ApiLog[] = [
                {
                    id: 1,
                    api_key_id: 1,
                    ip_address: Buffer.from("192.168.1.1"),
                    created: new Date("2024-01-01"),
                },
                {
                    id: 2,
                    api_key_id: 1,
                    ip_address: Buffer.from("192.168.1.2"),
                    created: new Date("2024-01-02"),
                },
            ];

            mockQuery.mockResolvedValue(mockLogs);

            const result = await ApiLogsRepository.listByApiKey(apiKeyId);

            expect(mockQuery).toHaveBeenCalledWith(
                "select id, api_key_id, user_id, inet6_ntoa(ip_address) as ip, created from api_logs where api_key_id = ? order by id",
                [apiKeyId],
            );
            expect(result).toEqual(mockLogs);
            expect(result).toHaveLength(2);
        });

        test("should return empty array when no logs found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiLogsRepository.listByApiKey(999);

            expect(result).toEqual([]);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(ApiLogsRepository.listByApiKey(1)).rejects.toThrow(
                "Query failed",
            );
        });
    });

    describe("getCountByInterval", () => {
        test("should count logs within a day interval", async () => {
            const apiKeyId = 1;
            const intervalUnit = "day";
            const interval = 1;
            const mockCount = 150;

            mockQuery.mockResolvedValue([{ count: mockCount }]);

            const result = await ApiLogsRepository.getCountByInterval(
                apiKeyId,
                intervalUnit,
                interval,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining(
                    "SELECT COALESCE(COUNT(id), 0) as count",
                ),
                [apiKeyId, interval],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("INTERVAL ? DAY"),
                [apiKeyId, interval],
            );
            expect(result).toBe(mockCount);
        });

        test("should count logs within an hour interval", async () => {
            const apiKeyId = 2;
            const intervalUnit = "hour";
            const interval = 24;
            const mockCount = 500;

            mockQuery.mockResolvedValue([{ count: mockCount }]);

            const result = await ApiLogsRepository.getCountByInterval(
                apiKeyId,
                intervalUnit,
                interval,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("INTERVAL ? HOUR"),
                [apiKeyId, interval],
            );
            expect(result).toBe(mockCount);
        });

        test("should return 0 when no logs found", async () => {
            mockQuery.mockResolvedValue([{ count: 0 }]);

            const result = await ApiLogsRepository.getCountByInterval(
                999,
                "day",
                1,
            );

            expect(result).toBe(0);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Count query failed"));

            await expect(
                ApiLogsRepository.getCountByInterval(1, "day", 1),
            ).rejects.toThrow("Count query failed");
        });
    });
});
