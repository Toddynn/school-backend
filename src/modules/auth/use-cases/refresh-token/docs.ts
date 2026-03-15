import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshTokenDto } from '../../models/dto/input/refresh-token.dto';
import { AuthTokensDto } from '../../models/dto/output/auth-tokens.dto';

export function RefreshTokenDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Refresh access token',
			description: 'Generates new access and refresh tokens using a valid refresh token.',
		}),
		ApiBody({
			type: RefreshTokenDto,
			description: 'Refresh token',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Tokens refreshed successfully.',
			type: AuthTokensDto,
		}),
		ApiResponse({
			status: HttpStatus.UNAUTHORIZED,
			description: 'Invalid or expired refresh token.',
		}),
	);
}
