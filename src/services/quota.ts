import { ApiQuota } from '../models/api-quota';
import { ApiQuotaRepository } from '../repositories/apiQuotaRepository';
import { ApiQuotaResponse } from '../models/api-quota-response';
import { ApiLogRepository } from '../repositories/apiLogRepository';
const check =  async (api_key_id: number): Promise<ApiQuotaResponse> => {
    const {findByApiKeyId} = ApiQuotaRepository
    const quotas: ApiQuota[] = await findByApiKeyId(api_key_id);

    const {create} = ApiLogRepository;



    return {quotas} as ApiQuotaResponse;
};

export default {
  check,
};