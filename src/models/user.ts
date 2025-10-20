export type User = {
  id: number;
  username: string;
  password_hash: string;
  is_enabled: boolean;
  is_deleted: boolean;
  updated: Date;
  created: Date;
};