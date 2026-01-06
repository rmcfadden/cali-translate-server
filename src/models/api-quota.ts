export type ApiQuota = {
    id: number;
    api_key_id: number;
    val: number;
    interval_unit: string;
    restrict_by_ip: boolean;
    is_enabled: boolean;
    updated: Date;
    created: Date;
};
