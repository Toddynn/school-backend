import { resolve } from 'node:path';
import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class PgTypeOrmConfigService implements TypeOrmOptionsFactory {
	constructor(private readonly configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		const entitiesPath = resolve(__dirname, '../../', '**', `*.entity.{ts,js}`);

		const sync = this.configService.get<string>('pg_db.sync') === `true`;

		return {
			type: 'postgres',
			host: this.configService.get<string>('pg_db.host'),
			port: this.configService.get<number>('pg_db.port'),
			username: this.configService.get<string>('pg_db.username'),
			password: this.configService.get<string>('pg_db.password'),
			database: this.configService.get<string>('pg_db.database'),
			schema: this.configService.get<string>('pg_db.schema'),
			entities: [entitiesPath],
			synchronize: sync,
		};
	}
}
