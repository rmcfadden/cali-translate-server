export type ApiLog = {
  id: number;
  api_key_id: number;
  ip_address: Buffer; // varbinary(16) from MySQL driver -> Buffer
  user_id?: number;
  created: Date;
};