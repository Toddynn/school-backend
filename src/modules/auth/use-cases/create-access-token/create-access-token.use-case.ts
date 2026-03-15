import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import type { UsersRepositoryInterface } from '@/modules/users/models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '@/modules/users/shared/constants/repository-interface-key';
import { env } from '@/shared/constants/env-variables';
import { InvalidCredentialsException } from '../../errors/invalid-credentials.error';
import type { LoginDto } from '../../models/dto/input/login.dto';
import type { AuthTokensDto } from '../../models/dto/output/auth-tokens.dto';
import type { JwtPayload } from '../../strategies/jwt.strategy';

@Injectable()
export class CreateAccessTokenUseCase {
	constructor(
		@Inject(USER_REPOSITORY_INTERFACE_KEY)
		private readonly usersRepository: UsersRepositoryInterface,
		private readonly jwtService: JwtService,
	) {}

	async execute(loginDto: LoginDto): Promise<AuthTokensDto> {
		const user = await this.usersRepository
			.createQueryBuilder('user')
			.addSelect('user.password')
			.where('user.email = :email', { email: loginDto.email })
			.getOne();

		if (!user) {
			throw new InvalidCredentialsException();
		}

		const isPasswordValid = await compare(loginDto.password, user.password);
		if (!isPasswordValid) {
			throw new InvalidCredentialsException();
		}

		const payload: JwtPayload = { sub: user.id, email: user.email, roles: user.roles };

		const access_token = this.jwtService.sign(payload);
		const refresh_token = this.jwtService.sign(payload, {
			secret: env.JWT_REFRESH_SECRET,
			expiresIn: env.JWT_REFRESH_EXPIRES_IN,
		});

		const refresh_token_hash = createHash('sha256').update(refresh_token).digest('hex');
		await this.usersRepository.update(user.id, { refresh_token_hash });

		return { access_token, refresh_token };
	}
}
