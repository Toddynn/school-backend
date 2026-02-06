import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCourseDto } from '../../models/dto/input/create-course.dto';
import { CourseDto } from '../../models/dto/output/course.dto';

export function CreateCourseDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new course',
			description: 'Creates a new course with title, description, image_url (HTTPS only) and themes. Themes must be valid enum values.',
		}),
		ApiBody({
			type: CreateCourseDto,
			description: 'Data for course creation',
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: 'Course created successfully.',
			type: CourseDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for course creation. image_url must be a valid HTTPS URL. Themes must be valid enum values.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating course.',
		}),
	);
}
