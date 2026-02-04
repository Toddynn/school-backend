import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
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
	@UpdateUserDocs()
	async execute(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto): Promise<UpdateResult> {
		return await this.updateUserUseCase.execute(userId, updateUserDto);
	}
}
