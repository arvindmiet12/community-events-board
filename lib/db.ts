const { loadEnvConfig } = require('@next/env'); 
loadEnvConfig(process.cwd());
import sql from "mssql/msnodesqlv8";


const config: sql.config & { connectionString: string } = {
  server: process.env.DB_SERVER || 'DESKTOP-IDT776H',
  port: Number(process.env.DB_PORT  || 1433),
  database: process.env.DB_NAME || 'CommunityEventsBoard',
  driver: process.env.DB_DRIVER || 'msnodesqlv8',
  connectionString: `Driver={${process.env.DB_ODBC_DRIVER || 'ODBC Driver 18 for SQL Server'}};Server=tcp:${process.env.DB_SERVER || 'DESKTOP-IDT776H'},${Number(process.env.DB_PORT || 1433)};Database=${process.env.DB_NAME || 'CommunityEventsBoard'};Trusted_Connection=yes;TrustServerCertificate=yes;Encrypt=no;`,
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    encrypt: false,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};
let poolPromise: Promise<sql.ConnectionPool> | null = null;
export async function db() {
  //if (!config.password) throw new Error('Set DB_PASSWORD in your .env.local file.');
  if (!poolPromise) poolPromise = new sql.ConnectionPool(config).connect();
  try { return await poolPromise; } catch (e) { poolPromise = null; throw e; }
}

export { sql ,config };
