import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
import { UpdateUserDto } from '../../models/dto/input/update-user.dto';
import { UpdateUserDocs } from './docs';
import { UpdateUserUseCase } from './update-user.use-case';

@ApiTags('Users')
@Controller('users')
export class UpdateUserController {
	constructor(
		@Inject(UpdateUserUseCase)
		private readonly updateUserUseCase: UpdateUserUseCase,
	) {}

	@Patch(':id')
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@UpdateUserDocs()
	async execute(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto): Promise<UpdateResult> {
		return await this.updateUserUseCase.execute(userId, updateUserDto);
	}
}
