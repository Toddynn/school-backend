import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The name of the user' })
	name: string;

	@IsString()
	@IsNotEmpty()
	@IsEmail({}, { message: `O email deve ser um email válido.` })
	@ApiProperty({ description: 'The email of the user' })
	email: string;
}
