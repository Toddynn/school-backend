import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
import { GetExistingUserDocs } from './docs';
import { GetExistingUserUseCase } from './get-existing-user.use-case';

@ApiTags('Users')
@Controller('users')
export class GetExistingUserController {
	constructor(
		@Inject(GetExistingUserUseCase)
		private readonly getExistingUserUseCase: GetExistingUserUseCase,
	) {}

	@Get(':id')
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@GetExistingUserDocs()
	async execute(@Param('id', ParseUUIDPipe) userId: string) {
		return await this.getExistingUserUseCase.execute({ where: { id: userId } }, { throwIfNotFound: true });
	}
}
