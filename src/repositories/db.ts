import mysql from "mysql2/promise";

export const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "rootpassword",
    database: process.env.DB_NAME || "translate",
    waitForConnections: true,
    connectionLimit: 10,
    typeCast: function castField(field, useDefaultTypeCasting) {
        // Convert BIT(1) to boolean on read
        if (field.type === "BIT" && field.length === 1) {
            const buffer = field.buffer();
            return buffer ? buffer[0] === 1 : false;
        }
        return useDefaultTypeCasting();
    },
});

export async function query<T = any>(
    sql: string,
    params: any[] = [],
): Promise<T[]> {
    const [rows] = await pool.execute<T[] & mysql.RowDataPacket[]>(sql, params);
    return rows as T[];
}
