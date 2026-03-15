import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { CourseWithClassesStatusCountsDto } from '../../models/dto/output/course-with-classes-status-counts.dto';

export function ListAllCoursesDocs() {
	return applyDecorators(
		ApiExtraModels(PaginatedResponseDto<CourseWithClassesStatusCountsDto>),
		ApiOperation({
			summary: 'List all courses',
			description: 'Returns a paginated list with all registered courses, including the count of available and closed classes for each course.',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of courses returned successfully.',
			schema: getPaginatedResponseSchema(CourseWithClassesStatusCountsDto),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing courses.',
		}),
	);
}
