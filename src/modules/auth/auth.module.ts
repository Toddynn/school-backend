import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { env } from '@/shared/constants/env-variables';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CreateAccessTokenController } from './use-cases/create-access-token/create-access-token.controller';
import { CreateAccessTokenUseCase } from './use-cases/create-access-token/create-access-token.use-case';
import { LogoutController } from './use-cases/logout/logout.controller';
import { LogoutUseCase } from './use-cases/logout/logout.use-case';
import { RefreshTokenController } from './use-cases/refresh-token/refresh-token.controller';
import { RefreshTokenUseCase } from './use-cases/refresh-token/refresh-token.use-case';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: env.JWT_SECRET,
			signOptions: { expiresIn: env.JWT_EXPIRES_IN },
		}),
	],
	controllers: [CreateAccessTokenController, RefreshTokenController, LogoutController],
	providers: [JwtStrategy, CreateAccessTokenUseCase, RefreshTokenUseCase, LogoutUseCase],
})
export class AuthModule {}
