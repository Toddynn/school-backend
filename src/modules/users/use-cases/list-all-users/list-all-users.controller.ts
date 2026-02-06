import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { ListAllUsersDocs } from './docs';
import { ListAllUsersUseCase } from './list-all-users.use-case';

@ApiTags('Users')
@Controller('users')
export class ListAllUsersController {
	constructor(
		@Inject(ListAllUsersUseCase)
		private readonly listAllUsersUseCase: ListAllUsersUseCase,
	) {}

	@Get('/paginated')
	@ListAllUsersDocs()
	async execute(@Query() paginationDto: PaginationDto) {
		return await this.listAllUsersUseCase.execute(paginationDto);
	}
}
