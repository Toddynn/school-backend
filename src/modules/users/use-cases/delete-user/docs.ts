import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { NotFoundUserException } from '../../errors/not-found-user.error';

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
		ApiResponse(getExceptionResponseSchema(NotFoundUserException, ['{"id":"..."}'])),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while deleting user.',
		}),
	);
}
