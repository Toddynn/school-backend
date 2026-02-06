import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { UserDto } from '../../models/dto/output/user.dto';

export function ListAllUsersDocs() {
	return applyDecorators(
		ApiExtraModels(PaginatedResponseDto<UserDto>),
		ApiOperation({
			summary: 'List all users',
			description: 'Returns a paginated list with all registered users.',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of users returned successfully.',
			schema: getPaginatedResponseSchema(UserDto),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing users.',
		}),
	);
}
