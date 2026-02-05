import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteCourseClassDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Delete class',
			description: 'Deletes a class by id.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the class to be deleted',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Class deleted successfully.',
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'Class not found.',
			schema: {
				example: {
					message: 'Turma não encontrada com os critérios: {"id":"..."}',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while deleting class.',
		}),
	);
}
