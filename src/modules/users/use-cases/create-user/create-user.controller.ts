import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../models/dto/input/create-user.dto';
import { User } from '../../models/entities/user.entity';
import { CreateUserUseCase } from './create-user.use-case';
import { CreateUserDocs } from './docs';

@ApiTags('Users')
@Controller('users')
export class CreateUserController {
	constructor(
		@Inject(CreateUserUseCase)
		private readonly createUserUseCase: CreateUserUseCase,
	) {}

	@Post()
	@CreateUserDocs()
	async execute(@Body() createUserDto: CreateUserDto): Promise<User> {
		return await this.createUserUseCase.execute(createUserDto);
	}
}
