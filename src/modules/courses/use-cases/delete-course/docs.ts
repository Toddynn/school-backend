import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { NotFoundCourseException } from '../../errors/not-found-course.error';

export function DeleteCourseDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Delete course',
			description: 'Deletes a course by id.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the course to be deleted',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Course deleted successfully.',
		}),
		ApiResponse(getExceptionResponseSchema(NotFoundCourseException, ['{"id":"..."}'])),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while deleting course.',
		}),
	);
}
