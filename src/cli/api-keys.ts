import { Command } from "commander";
import crypto from "crypto";
import { UsersRepository } from "../repositories/users-repository";
import { ApiKeysRepository } from "../repositories/api-keys-repository";
import { ApiQuotasRepository } from "../repositories/api-quotas-repository";
import { ApiLogsRepository } from "../repositories/api-logs-repository";
import { ApiQuota } from "../models/api-quota";

const program = new Command();
program.version("1.0.0").description("Edit api keys");

program
    .command("add <username>")
    .description("Create a new api key for username")
    .action(async (username: string) => {
        const { findByUsername } = UsersRepository;
        const existingUser = await findByUsername(username);
        if (!existingUser) {
            console.error(`User with username "${username}" does not exist`);
            process.exit(1);
        }
        const name = crypto.randomBytes(32).toString("hex");
        const secret = crypto.randomBytes(32).toString("hex");
        const { create } = ApiKeysRepository;
        const newApiKeyId = await create({
            user_id: existingUser.id,
            name,
            secret,
        });
        const token = Buffer.from(`${name}:${secret}`).toString("base64");
        console.log(
            `Api key created with Id: ${newApiKeyId} and name: ${name} and secret: ${secret}\n`,
        );
        console.log(`Header x-api-key: ${token}`);
        console.log(`Query x-api-key=${token}`);
        process.exit(1);
    });

program
    .command("get <key>")
    .description("Get api key by name or id")
    .action(async (key: string) => {
        const { findByName, findById } = ApiKeysRepository;
        const apiKey = isNaN(Number(key))
            ? await findByName(key)
            : await findById(Number(key));
        if (!apiKey) {
            console.error(`Api key "${key}" not found`);
            process.exit(1);
        }
        console.log(
            `Api Key name: ${apiKey.name}, User Id: ${apiKey.user_id}, Enabled: ${apiKey.is_enabled}, Created: ${apiKey.created}`,
        );
        process.exit(1);
    });

program
    .command("quota-list <key>")
    .description("List quotas for api key")
    .action(async (key: string) => {
        const getQuotaUsage = (quota: ApiQuota): Promise<number> =>
            ApiLogsRepository.getCountByInterval(
                quota.api_key_id,
                quota.interval_unit,
                quota.val,
            );
        const getQuotaInfo = async (quota: ApiQuota): Promise<string> =>
            `Quota Id: ${quota.id}, Interval: ${quota.val} ${quota.interval_unit}, Used: ${await getQuotaUsage(quota)}, Enabled: ${quota.is_enabled}`;
        const apiKey = await getApiKeyByKeyOrExit(key);
        const { listByApiKey } = ApiQuotasRepository;
        const quotas = await listByApiKey(apiKey.id);
        const quotaInfos = await Promise.all(quotas.map(getQuotaInfo));
        const quaotaText = quotaInfos.join("\n");
        console.log(`Quotas: ${quaotaText}`);
        process.exit(1);
    });

program
    .command("quota-add <key> <intervalUnit> <interval> [restrictByIp]")
    .description("Add quota for api key")
    .action(
        async (
            key: string,
            interval_unit: string,
            interval: number,
            restrictByIp: boolean = false,
        ) => {
            console.log("restrictByIp", restrictByIp);
            const apiKey = await getApiKeyByKeyOrExit(key);
            const { create } = ApiQuotasRepository;
            const newQuotaId = await create({
                api_key_id: apiKey.id,
                val: interval,
                interval_unit,
                restrict_by_ip: restrictByIp,
            });
            console.log(`Quota created with Id: ${newQuotaId}`);
            process.exit(1);
        },
    );

const getApiKeyByKeyOrExit = async (key: string) => {
    const { findByName, findById } = ApiKeysRepository;
    const apiKey = isNaN(Number(key))
        ? await findByName(key)
        : await findById(Number(key));
    if (!apiKey) {
        console.error(`Api key "${key}" not found`);
        process.exit(1);
    }
    return apiKey;
};

program.parse(process.argv);
