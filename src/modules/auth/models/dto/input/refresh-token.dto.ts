import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The refresh token' })
	refresh_token: string;
}
