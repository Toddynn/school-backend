import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../../models/dto/input/login.dto';
import { AuthTokensDto } from '../../models/dto/output/auth-tokens.dto';

export function CreateAccessTokenDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'User login',
			description: 'Authenticates a user with email and password, returning access and refresh tokens.',
		}),
		ApiBody({
			type: LoginDto,
			description: 'User credentials',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Login successful.',
			type: AuthTokensDto,
		}),
		ApiResponse({
			status: HttpStatus.UNAUTHORIZED,
			description: 'Invalid credentials.',
		}),
	);
}
