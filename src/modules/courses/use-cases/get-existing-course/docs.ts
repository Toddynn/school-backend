import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { NotFoundCourseException } from '../../errors/not-found-course.error';
import { CourseDto } from '../../models/dto/output/course.dto';

export function GetExistingCourseDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Get course by ID',
			description: 'Returns a course by its ID.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the course to be retrieved',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Course found successfully.',
			type: CourseDto,
		}),
		ApiResponse(getExceptionResponseSchema(NotFoundCourseException, ['{"id":"..."}'])),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while retrieving course.',
		}),
	);
}
