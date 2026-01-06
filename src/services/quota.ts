import { ApiQuota } from "../models/api-quota";
import { ApiQuotasRepository } from "../repositories/apiQuotasRepository";
import { ApiQuotaResponse } from "../models/api-quota-response";
import { ApiKeyHitsRepository } from "../repositories/apiKeyHitsRepository";
const check = async (api_key_id: number): Promise<ApiQuotaResponse> => {
    const { findByApiKeyId } = ApiQuotasRepository;
    const quotas: ApiQuota[] = await findByApiKeyId(api_key_id);
    const { getCountByInterval } = ApiKeyHitsRepository;
    const counts = await Promise.all(
        quotas.map(async (quota) =>
            getCountByInterval(
                quota.api_key_id,
                quota.interval_unit,
                quota.val,
            ),
        ),
    );
    const quotasWithCounts = quotas.map((quota, index) => ({
        ...quota,
        count: counts[index],
    }));
    const exceeededingQuotas = quotasWithCounts.filter(
        (quota) => quota.is_enabled && quota.count > quota.val,
    );
    if (exceeededingQuotas.length > 0) {
        const exceededMessage = exceeededingQuotas.reduce(
            (msg, quota) =>
                msg +
                `Quota Id: ${quota.id} exceeded. Used: ${quota.count}, Limit: ${quota.val} ${quota.interval_unit}\n`,
            "",
        );
        throw new Error(
            `API Quota exceeded for api_key_id ${api_key_id}:\n${exceededMessage}`,
        );
    }
    return { quotas: quotasWithCounts } as ApiQuotaResponse;
};

export default {
    check,
};
