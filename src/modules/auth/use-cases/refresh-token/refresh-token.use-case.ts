import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UsersRepositoryInterface } from '@/modules/users/models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '@/modules/users/shared/constants/repository-interface-key';
import { env } from '@/shared/constants/env-variables';
import { InvalidRefreshTokenException } from '../../errors/invalid-refresh-token.error';
import type { RefreshTokenDto } from '../../models/dto/input/refresh-token.dto';
import type { AuthTokensDto } from '../../models/dto/output/auth-tokens.dto';
import type { JwtPayload } from '../../strategies/jwt.strategy';

@Injectable()
export class RefreshTokenUseCase {
	constructor(
		@Inject(USER_REPOSITORY_INTERFACE_KEY)
		private readonly usersRepository: UsersRepositoryInterface,
		private readonly jwtService: JwtService,
	) {}

	async execute(refreshTokenDto: RefreshTokenDto): Promise<AuthTokensDto> {
		let payload: JwtPayload;
		try {
			payload = this.jwtService.verify<JwtPayload>(refreshTokenDto.refresh_token, {
				secret: env.JWT_REFRESH_SECRET,
			});
		} catch {
			throw new InvalidRefreshTokenException();
		}

		const user = await this.usersRepository
			.createQueryBuilder('user')
			.addSelect('user.refresh_token_hash')
			.where('user.id = :id', { id: payload.sub })
			.getOne();

		if (!user?.refresh_token_hash) {
			throw new InvalidRefreshTokenException();
		}

		const incomingHash = createHash('sha256').update(refreshTokenDto.refresh_token).digest('hex');
		if (incomingHash !== user.refresh_token_hash) {
			throw new InvalidRefreshTokenException();
		}

		const newPayload: JwtPayload = { sub: user.id, email: user.email, roles: user.roles };

		const access_token = this.jwtService.sign(newPayload);
		const refresh_token = this.jwtService.sign(newPayload, {
			secret: env.JWT_REFRESH_SECRET,
			expiresIn: env.JWT_REFRESH_EXPIRES_IN,
		});

		const refresh_token_hash = createHash('sha256').update(refresh_token).digest('hex');
		await this.usersRepository.update(user.id, { refresh_token_hash });

		return { access_token, refresh_token };
	}
}
