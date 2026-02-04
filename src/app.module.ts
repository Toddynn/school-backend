import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import pg_db_config from './configs/database/pg-database.config';
import { PgTypeOrmConfigService } from './configs/database/pg-typeorm-config.service';
import { ThemesModule } from './modules/themes/themes.module';
import { ReflectionGuardValidationPipe } from './shared/pipes/safe-type-declaration-pipe';

@Module({
	imports: [
		ThemesModule,
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
			load: [pg_db_config],
		}),
		TypeOrmModule.forRootAsync({
			useFactory: (configService: ConfigService) => {
				const service = new PgTypeOrmConfigService(configService);
				return service.createTypeOrmOptions();
			},
			inject: [ConfigService],
		}),
	],
	controllers: [],
	providers: [ReflectionGuardValidationPipe],
})
export class AppModule {}
