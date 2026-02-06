import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { CourseClassDto } from '../../models/dto/output/course-class.dto';

export function ListAllClassesDocs() {
	return applyDecorators(
		ApiExtraModels(PaginatedResponseDto<CourseClassDto>),
		ApiOperation({
			summary: 'List all classes',
			description: 'Returns a paginated list with all registered classes.',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of classes returned successfully.',
			schema: getPaginatedResponseSchema(CourseClassDto),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing classes.',
		}),
	);
}
