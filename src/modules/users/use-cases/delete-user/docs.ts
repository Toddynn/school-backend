import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteUserDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Delete user',
			description: 'Deletes a user by id.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the user to be deleted',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'User deleted successfully.',
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'User not found.',
			schema: {
				example: {
					message: 'Usuário não encontrado com os critérios: {"id":"..."}',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while deleting user.',
		}),
	);
}
