import { ApiKeyHitsRepository } from "../repositories/api-key-hits-repository";
import type { ApiKeyHit } from "../models/api-key-hit";
import * as db from "../repositories/db";

jest.mock("../repositories/db");

describe("ApiKeyHitsRepository", () => {
    const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create an API key hit with IPv4 address", async () => {
            const apiKeyId = 1;
            const ipAddress = "192.168.1.1";
            const expectedId = 42;

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: expectedId } as ApiKeyHit]);

            const result = await ApiKeyHitsRepository.create(
                apiKeyId,
                ipAddress,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                "insert into api_key_hits (api_key_id, ip_address) values (?, inet6_aton(?))",
                [apiKeyId, ipAddress],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                "select id from api_key_hits where api_key_id = ? order by id desc limit 1",
                [apiKeyId],
            );
            expect(result).toBe(expectedId);
        });

        test("should create an API key hit with IPv6 address", async () => {
            const apiKeyId = 2;
            const ipAddress = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
            const expectedId = 43;

            mockQuery
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ id: expectedId } as ApiKeyHit]);

            const result = await ApiKeyHitsRepository.create(
                apiKeyId,
                ipAddress,
            );

            expect(mockQuery).toHaveBeenCalledWith(
                "insert into api_key_hits (api_key_id, ip_address) values (?, inet6_aton(?))",
                [apiKeyId, ipAddress],
            );
            expect(result).toBe(expectedId);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Insert failed"));

            await expect(
                ApiKeyHitsRepository.create(1, "192.168.1.1"),
            ).rejects.toThrow("Insert failed");
        });
    });

    describe("listByApiKey", () => {
        test("should list all hits for an API key with readable IPs", async () => {
            const apiKeyId = 1;
            const mockHits: ApiKeyHit[] = [
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

            mockQuery.mockResolvedValue(mockHits);

            const result = await ApiKeyHitsRepository.listByApiKey(apiKeyId);

            expect(mockQuery).toHaveBeenCalledWith(
                "select id, api_key_id, user_id, inet6_ntoa(ip_address) as ip, created from api_key_hits where api_key_id = ? order by id",
                [apiKeyId],
            );
            expect(result).toEqual(mockHits);
            expect(result).toHaveLength(2);
        });

        test("should return empty array when no hits found", async () => {
            mockQuery.mockResolvedValue([]);

            const result = await ApiKeyHitsRepository.listByApiKey(999);

            expect(result).toEqual([]);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Query failed"));

            await expect(
                ApiKeyHitsRepository.listByApiKey(1),
            ).rejects.toThrow("Query failed");
        });
    });

    describe("getCountByInterval", () => {
        test("should count hits within a day interval", async () => {
            const apiKeyId = 1;
            const intervalUnit = "day";
            const interval = 1;
            const mockCount = 42;

            mockQuery.mockResolvedValue([{ count: mockCount }]);

            const result = await ApiKeyHitsRepository.getCountByInterval(
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

        test("should count hits within an hour interval", async () => {
            const apiKeyId = 2;
            const intervalUnit = "hour";
            const interval = 24;
            const mockCount = 150;

            mockQuery.mockResolvedValue([{ count: mockCount }]);

            const result = await ApiKeyHitsRepository.getCountByInterval(
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

        test("should return 0 when no hits found", async () => {
            mockQuery.mockResolvedValue([{ count: 0 }]);

            const result = await ApiKeyHitsRepository.getCountByInterval(
                999,
                "day",
                1,
            );

            expect(result).toBe(0);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("Count query failed"));

            await expect(
                ApiKeyHitsRepository.getCountByInterval(1, "day", 1),
            ).rejects.toThrow("Count query failed");
        });
    });

    describe("getCountByIntervalIPAddress", () => {
        test("should count hits by interval and IP address", async () => {
            const apiKeyId = 1;
            const intervalUnit = "hour";
            const interval = 1;
            const ipAddress = "192.168.1.1";
            const mockCount = 5;

            mockQuery.mockResolvedValue([{ count: mockCount }]);

            const result =
                await ApiKeyHitsRepository.getCountByIntervalIPAddress(
                    apiKeyId,
                    intervalUnit,
                    interval,
                    ipAddress,
                );

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining(
                    "SELECT COALESCE(COUNT(id), 0) as count",
                ),
                [apiKeyId, ipAddress, interval],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("ip_address = INET6_ATON(?)"),
                [apiKeyId, ipAddress, interval],
            );
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("INTERVAL ? HOUR"),
                [apiKeyId, ipAddress, interval],
            );
            expect(result).toBe(mockCount);
        });

        test("should handle IPv6 addresses", async () => {
            const apiKeyId = 2;
            const intervalUnit = "minute";
            const interval = 60;
            const ipAddress = "2001:0db8:85a3::8a2e:0370:7334";
            const mockCount = 10;

            mockQuery.mockResolvedValue([{ count: mockCount }]);

            const result =
                await ApiKeyHitsRepository.getCountByIntervalIPAddress(
                    apiKeyId,
                    intervalUnit,
                    interval,
                    ipAddress,
                );

            expect(result).toBe(mockCount);
        });

        test("should return 0 when no hits found for IP", async () => {
            mockQuery.mockResolvedValue([{ count: 0 }]);

            const result =
                await ApiKeyHitsRepository.getCountByIntervalIPAddress(
                    1,
                    "day",
                    1,
                    "192.168.1.99",
                );

            expect(result).toBe(0);
        });

        test("should handle database errors", async () => {
            mockQuery.mockRejectedValue(new Error("IP count query failed"));

            await expect(
                ApiKeyHitsRepository.getCountByIntervalIPAddress(
                    1,
                    "day",
                    1,
                    "192.168.1.1",
                ),
            ).rejects.toThrow("IP count query failed");
        });
    });
});
