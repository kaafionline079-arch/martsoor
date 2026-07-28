import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../../.env') });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL missing in .env');
  process.exit(1);
}

const schema = readFileSync(join(__dirname, '../schema.sql'), 'utf8');
const pool = new Pool({ connectionString: url });

try {
  await pool.query(schema);
  console.log('Migration complete.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
