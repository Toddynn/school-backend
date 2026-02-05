import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

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
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'Course not found.',
			schema: {
				example: {
					message: 'Curso não encontrado com os critérios: {"id":"..."}',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while deleting course.',
		}),
	);
}
