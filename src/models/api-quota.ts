export type ApiQuota = {
  id: number;
  api_key_id: number;
  interval: number;
  interval_unit: string;
  is_enabled: boolean;
  updated: Date;
  created: Date;
};
