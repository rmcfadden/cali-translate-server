import { ServiceCostRequest } from "../models/service-cost-request";
import { ServiceCostResponse } from "../models/service-cost-response";
import { ServicesRepository } from "../repositories/services-repository";
const calculate = async (
    request: ServiceCostRequest,
): Promise<ServiceCostResponse> => {
    if (!request.serviceName) throw new Error("serviceName is required");
    const { findByName } = ServicesRepository;
    const service = await findByName(request.serviceName);
    if (!service) throw new Error(`Service not found: ${request.serviceName}`);
    return { cost: 0 } as ServiceCostResponse;
};
export default {
    calculate,
};
