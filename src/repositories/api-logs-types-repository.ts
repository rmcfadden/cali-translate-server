import { query } from "./db";
import type { ApiLogType } from "../models/api-log-type";

export const ApiLogsTypesRepository = {
    async list(): Promise<ApiLogType[]> {
        return query<ApiLogType>(
            "select id, name, created from api_log_types",
            [],
        );
    },
};
