export type ApiQuota = {
  id: number;
  user_id: number;
  project_id: number;
  quota_limit: number;
  quota_used: number;
  reset_at: Date;
  updated: Date;
  created: Date;
};
