import { Inject, Injectable } from '@nestjs/common';
import type { UpdateResult } from 'typeorm';
import type { UpdateUserDto } from '../../models/dto/input/update-user.dto';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingUserUseCase } from '../get-existing-user/get-existing-user.use-case';

@Injectable()
export class UpdateUserUseCase {
	constructor(
		@Inject(USER_REPOSITORY_INTERFACE_KEY)
		private readonly usersRepository: UsersRepositoryInterface,
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
	) {}

	async execute(userId: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
		await this.getExistingUserUseCase.execute({ where: { id: userId } }, { throwIfNotFound: true });

		return await this.usersRepository.update(userId, updateUserDto);
	}
}
