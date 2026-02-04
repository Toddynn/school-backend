import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from '../../models/dto/input/update-user.dto';
import { UserDto } from '../../models/dto/output/user.dto';

export function UpdateUserDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Update user data',
			description: 'Updates user data. Password cannot be changed through this endpoint. Use the password recovery flow to change the password.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the user to be updated',
			type: String,
		}),
		ApiBody({
			type: UpdateUserDto,
			description: 'Data for user update',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'User updated successfully.',
			type: UserDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for user update.',
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'User not found.',
			schema: {
				example: {
					message: 'User não encontrado com os critérios: {"id":"..."}',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while updating user.',
		}),
	);
}
