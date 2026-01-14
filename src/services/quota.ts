import { ApiQuota } from "../models/api-quota";
import { ApiQuotasRepository } from "../repositories/api-quotas-repository";
import { ApiQuotaResponse } from "../models/api-quota-response";
import { ApiQuotaRequest } from "../models/api-quota-request";
import { ApiKeyHitsRepository } from "../repositories/api-key-hits-repository";
const check = async (request: ApiQuotaRequest): Promise<ApiQuotaResponse> => {
    const { findByApiKeyId } = ApiQuotasRepository;
    const { apiKeyId: api_key_id, ipAddress } = request;
    const quotas: ApiQuota[] = await findByApiKeyId(api_key_id);
    const { getCountByInterval, getCountByIntervalIPAddress } =
        ApiKeyHitsRepository;
    const counts = await Promise.all(
        quotas.map(async (quota) =>
            quota.restrict_by_ip
                ? getCountByIntervalIPAddress(
                      quota.api_key_id,
                      quota.interval_unit,
                      quota.val,
                      ipAddress,
                  )
                : getCountByInterval(
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
