import { Inject, Injectable } from '@nestjs/common';
import type { CreateUserDto } from '../../models/dto/input/create-user.dto';
import type { User } from '../../models/entities/user.entity';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingUserUseCase } from '../get-existing-user/get-existing-user.use-case';

@Injectable()
export class CreateUserUseCase {
	constructor(
		@Inject(USER_REPOSITORY_INTERFACE_KEY)
		private readonly usersRepository: UsersRepositoryInterface,
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
	) {}

	async execute(createUserDto: CreateUserDto): Promise<User> {
		await this.getExistingUserUseCase.execute({ where: { email: createUserDto.email } }, { throwIfFound: true });

		const user = this.usersRepository.create(createUserDto);

		return await this.usersRepository.save(user);
	}
}
