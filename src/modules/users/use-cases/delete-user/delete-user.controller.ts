import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { DeleteUserUseCase } from './delete-user.use-case';
import { DeleteUserDocs } from './docs';

@ApiTags('Users')
@Controller('users')
export class DeleteUserController {
	constructor(
		@Inject(DeleteUserUseCase)
		private readonly deleteUserUseCase: DeleteUserUseCase,
	) {}

	@Delete(':id')
	@DeleteUserDocs()
	async execute(@Param('id') userId: string): Promise<DeleteResult> {
		return await this.deleteUserUseCase.execute(userId);
	}
}
