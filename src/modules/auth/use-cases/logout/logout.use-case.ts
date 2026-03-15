import { Inject, Injectable } from '@nestjs/common';
import type { UsersRepositoryInterface } from '@/modules/users/models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '@/modules/users/shared/constants/repository-interface-key';
import type { JwtPayload } from '../../strategies/jwt.strategy';

@Injectable()
export class LogoutUseCase {
	constructor(
		@Inject(USER_REPOSITORY_INTERFACE_KEY)
		private readonly usersRepository: UsersRepositoryInterface,
	) {}

	async execute(currentUser: JwtPayload): Promise<void> {
		await this.usersRepository.update(currentUser.sub, { refresh_token_hash: null });
	}
}
