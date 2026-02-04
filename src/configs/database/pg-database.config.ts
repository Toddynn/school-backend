import { registerAs } from '@nestjs/config';
import { env } from '@/shared/constants/env-variables';

export default registerAs('pg_db', () => ({
	host: env.DB_HOST,
	port: env.DB_PORT,
	username: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.DB_DATABASE,
	schema: env.DB_SCHEMA,
	sync: env.DB_SYNC === 'true',
}));
