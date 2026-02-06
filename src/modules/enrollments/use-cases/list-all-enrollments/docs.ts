import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { EnrollmentDto } from '../../models/dto/output/enrollment.dto';

export function ListAllEnrollmentsDocs() {
	return applyDecorators(
		ApiExtraModels(PaginatedResponseDto<EnrollmentDto>),
		ApiOperation({
			summary: 'List all enrollments',
			description: 'Returns a paginated list with all enrollments including user, class and course relations.',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of enrollments returned successfully.',
			schema: getPaginatedResponseSchema(EnrollmentDto),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing enrollments.',
		}),
	);
}
