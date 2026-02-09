import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
	@GetExistingUserDocs()
	async execute(@Param('id', ParseUUIDPipe) userId: string) {
		return await this.getExistingUserUseCase.execute({ where: { id: userId } }, { throwIfNotFound: true });
	}
}
