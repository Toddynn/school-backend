import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCourseClassDto } from '../../models/dto/input/create-course-class.dto';
import { CourseClassDto } from '../../models/dto/output/course-class.dto';

export function CreateCourseClassDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new class',
			description: 'Creates a new class with title, description, spots, status, start_date and end_date.',
		}),
		ApiBody({
			type: CreateCourseClassDto,
			description: 'Data for class creation',
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: 'Class created successfully.',
			type: CourseClassDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for class creation.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating class.',
		}),
	);
}
