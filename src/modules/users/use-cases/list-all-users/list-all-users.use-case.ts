import { Inject, Injectable } from '@nestjs/common';
import type { PaginationDto } from '@/shared/dto/pagination.dto';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class ListAllUsersUseCase {
	constructor(
		@Inject(USER_REPOSITORY_INTERFACE_KEY)
		private readonly usersRepository: UsersRepositoryInterface,
	) {}

	async execute(paginationDto: PaginationDto) {
		return await this.usersRepository.listAllUsersPaginated(paginationDto);
	}
}
