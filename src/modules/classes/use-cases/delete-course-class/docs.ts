import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { NotFoundClassException } from '../../errors/not-found-class.error';

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
		ApiResponse(getExceptionResponseSchema(NotFoundClassException, ['{"id":"..."}'])),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while deleting class.',
		}),
	);
}
