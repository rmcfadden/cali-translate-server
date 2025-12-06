export type ApiKey = {
  id: number;
  user_id: number;
  name: string;
  secret: string;
  is_enabled: boolean;
  updated: Date;
  created: Date;
};