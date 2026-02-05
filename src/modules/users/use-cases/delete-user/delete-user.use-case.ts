import { Inject, Injectable } from '@nestjs/common';
import type { DeleteResult } from 'typeorm';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingUserUseCase } from '../get-existing-user/get-existing-user.use-case';

@Injectable()
export class DeleteUserUseCase {
	constructor(
		@Inject(USER_REPOSITORY_INTERFACE_KEY)
		private readonly usersRepository: UsersRepositoryInterface,
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
	) {}

	async execute(userId: string): Promise<DeleteResult> {
		await this.getExistingUserUseCase.execute({ where: { id: userId } }, { throwIfNotFound: true });

		return await this.usersRepository.delete(userId);
	}
}
