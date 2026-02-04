import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateThemeDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The name of the theme' })
	name: string;
}
