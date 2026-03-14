import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { NotFoundUserException } from '../../errors/not-found-user.error';
import { UserDto } from '../../models/dto/output/user.dto';

export function GetExistingUserDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Get user by ID',
			description: 'Returns a user by its ID.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the user to be retrieved',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'User found successfully.',
			type: UserDto,
		}),
		ApiResponse(getExceptionResponseSchema(NotFoundUserException, ['{"id":"..."}'])),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while retrieving user.',
		}),
	);
}
