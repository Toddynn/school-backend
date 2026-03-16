import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
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
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@DeleteUserDocs()
	async execute(@Param('id') userId: string): Promise<DeleteResult> {
		return await this.deleteUserUseCase.execute(userId);
	}
}
