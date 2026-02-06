import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { CreateUserDto } from '../../models/dto/input/create-user.dto';
import { UserDto } from '../../models/dto/output/user.dto';
import { UserAlreadyExistsException } from '../../errors/user-already-exists.error';

export function CreateUserDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new user',
			description: 'Creates a new user with name and email. The email is validated for uniqueness.',
		}),
		ApiBody({
			type: CreateUserDto,
			description: 'Data for user creation',
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: 'User created successfully.',
			type: UserDto,
		}),
		ApiResponse(getExceptionResponseSchema(UserAlreadyExistsException, ['{"email":"user@example.com"}'])),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for user creation.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating user.',
		}),
	);
}
