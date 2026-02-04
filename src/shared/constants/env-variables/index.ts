import { coerce, object, string } from 'zod/v4-mini';

const envSchema = object({
	APP_NAME: string({ error: 'APP_NAME is required.' }),

	APP_PROTOCOL: string({ error: 'APP_PROTOCOL is required.' }),
	APP_DOMAIN: string({ error: 'APP_DOMAIN is required.' }),
	APP_PORT: string({ error: 'APP_PORT is required.' }),

	FRONT_END_PROTOCOL: string({ error: 'FRONT_END_PROTOCOL is required.' }),
	FRONT_END_DOMAIN: string({ error: 'FRONT_END_DOMAIN is required.' }),
	FRONT_END_PORT: string({ error: 'FRONT_END_PORT is required.' }),

	DB_HOST: string({ error: 'DB_HOST is required.' }),
	DB_PORT: coerce.number({
		error: 'DB_PORT is required.',
	}),
	DB_USER: string({ error: 'DB_USER is required.' }),
	DB_PASSWORD: string({ error: 'DB_PASSWORD is required.' }),
	DB_DATABASE: string({ error: 'DB_DATABASE is required.' }),
	DB_SCHEMA: string({ error: 'DB_SCHEMA is required.' }),
	DB_SYNC: string({ error: 'DB_SYNC is required.' }),

	MEDIA_FILES_DEST: string({ error: 'MEDIA_FILES_DEST is required.' }),
});

const rawEnv = {
	APP_NAME: process.env.APP_NAME,

	APP_PROTOCOL: process.env.APP_PROTOCOL,
	APP_DOMAIN: process.env.APP_DOMAIN,
	APP_PORT: process.env.APP_PORT,

	FRONT_END_PROTOCOL: process.env.FRONT_END_PROTOCOL,
	FRONT_END_DOMAIN: process.env.FRONT_END_DOMAIN,
	FRONT_END_PORT: process.env.FRONT_END_PORT,

	DB_HOST: process.env.DB_HOST,
	DB_PORT: process.env.DB_PORT,
	DB_USER: process.env.DB_USER,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_DATABASE: process.env.DB_DATABASE,
	DB_SCHEMA: process.env.DB_SCHEMA,
	DB_SYNC: process.env.DB_SYNC,

	MEDIA_FILES_DEST: process.env.MEDIA_FILES_DEST,
} as const;

export const env = envSchema.parse(rawEnv);

const with_port = (protocol: string, domain: string, port?: string) => (port ? `${protocol}://${domain}:${port}` : `${protocol}://${domain}`);

export const BACK_END_URL = with_port(env.APP_PROTOCOL, env.APP_DOMAIN, env.APP_PORT);
export const FRONT_END_URL = with_port(env.FRONT_END_PROTOCOL, env.FRONT_END_DOMAIN, env.FRONT_END_PORT);
