import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { getExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { NotFoundClassException } from '../../errors/not-found-class.error';
import { UpdateCourseClassDto } from '../../models/dto/input/update-course-class.dto';
import { CourseClassDto } from '../../models/dto/output/course-class.dto';

export function UpdateCourseClassDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Update class data',
			description: 'Updates class data by id.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the class to be updated',
			type: String,
		}),
		ApiBody({
			type: UpdateCourseClassDto,
			description: 'Data for class update',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Class updated successfully.',
			type: CourseClassDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for class update.',
		}),
		ApiResponse(getExceptionResponseSchema(NotFoundClassException, ['{"id":"..."}'])),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while updating class.',
		}),
	);
}
