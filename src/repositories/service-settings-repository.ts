import { query } from "./db";
import type { ServiceSetting } from "../models/service-setting";

export const ServiceSettingsRepository = {
    async create(serviceSetting: Partial<ServiceSetting>): Promise<number> {
        const { service_id, name, value } = serviceSetting;
        await query(
            "insert into service_settings (service_id, name, value) values (?, ?, ?)",
            [service_id, name, value],
        );
        const rows = await query<ServiceSetting>(
            "select id from service_settings where service_id = ? and name = ? limit 1",
            [service_id, name],
        );
        return rows[0].id;
    },

    async findById(id: number): Promise<ServiceSetting | null> {
        const rows = await query<ServiceSetting>(
            "select * from service_settings where id = ? limit 1",
            [id],
        );
        return rows[0] ?? null;
    },

    async findByServiceAndName(
        service_id: number,
        name: string,
    ): Promise<ServiceSetting | null> {
        const rows = await query<ServiceSetting>(
            "select * from service_settings where service_id = ? and name = ? limit 1",
            [service_id, name],
        );
        return rows[0] ?? null;
    },

    async listByService(service_id: number): Promise<ServiceSetting[]> {
        return query<ServiceSetting>(
            "select * from service_settings where service_id = ? order by value",
            [service_id],
        );
    },

    async update(id: number, setting_value: string): Promise<void> {
        await query(
            "update service_settings set setting_value = ? where id = ?",
            [setting_value, id],
        );
    },

    async upsert(
        service_id: number,
        name: string,
        value: string,
    ): Promise<void> {
        const existing = await this.findByServiceAndName(service_id, name);
        if (existing) {
            await this.update(existing.id, value);
        } else {
            await this.create({ service_id, name, value });
        }
    },

    async delete(id: number): Promise<void> {
        await query("delete from service_settings where id = ?", [id]);
    },

    async deleteByServiceAndKey(
        service_id: number,
        name: string,
    ): Promise<void> {
        await query(
            "delete from service_settings where service_id = ? and name = ?",
            [service_id, name],
        );
    },
};
