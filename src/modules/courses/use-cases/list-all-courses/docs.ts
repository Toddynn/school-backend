import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import { getPaginatedResponseSchema } from '@/shared/helpers/paginated-response-schema.helper';
import { CourseDto } from '../../models/dto/output/course.dto';

export function ListAllCoursesDocs() {
	return applyDecorators(
		ApiExtraModels(PaginatedResponseDto<CourseDto>),
		ApiOperation({
			summary: 'List all courses',
			description: 'Returns a paginated list with all registered courses.',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'List of courses returned successfully.',
			schema: getPaginatedResponseSchema(CourseDto),
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while listing courses.',
		}),
	);
}
