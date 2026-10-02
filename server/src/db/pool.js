import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

let pool = null;

if (config.databaseUrl) {
  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  pool.on('connect', () => {
    console.log('✅ PostgreSQL connection established via pg.Pool');
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err);
  });
}

export const query = async (text, params) => {
  if (!pool) {
    throw new Error('PostgreSQL pool not configured. Please supply DATABASE_URL.');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === 'development') {
    console.log('Executed query', { text, duration, rows: res.rowCount });
  }
  return res;
};

export default pool;
