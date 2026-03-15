import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function LogoutDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'User logout',
			description: 'Invalidates the refresh token for the authenticated user.',
		}),
		ApiResponse({
			status: HttpStatus.NO_CONTENT,
			description: 'Logout successful.',
		}),
		ApiResponse({
			status: HttpStatus.UNAUTHORIZED,
			description: 'User not authenticated.',
		}),
	);
}
