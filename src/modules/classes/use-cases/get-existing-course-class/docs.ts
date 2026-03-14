import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { NotFoundClassException } from '../../errors/not-found-class.error';
import { CourseClassDto } from '../../models/dto/output/course-class.dto';

export function GetExistingCourseClassDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Get class by ID',
			description: 'Returns a class by its ID, including the course relation.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the class to be retrieved',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Class found successfully.',
			type: CourseClassDto,
		}),
		ApiResponse(getExceptionResponseSchema(NotFoundClassException, ['{"id":"..."}'])),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while retrieving class.',
		}),
	);
}
