import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import pg_db_config from './configs/database/pg-database.config';
import { PgTypeOrmConfigService } from './configs/database/pg-typeorm-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { CourseClassesModule } from './modules/classes/course-classes.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { UsersModule } from './modules/users/users.module';
import { ReflectionGuardValidationPipe } from './shared/pipes/safe-type-declaration-pipe';
import { DefaultUserSeeder } from './shared/seeders/default-user.seeder';

@Module({
	imports: [
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
		AuthModule,
		CourseClassesModule,
		CoursesModule,
		EnrollmentsModule,
		UsersModule,
	],
	providers: [
		ReflectionGuardValidationPipe,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
		DefaultUserSeeder,
	],
})
export class AppModule {}
