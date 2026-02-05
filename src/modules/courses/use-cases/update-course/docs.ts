import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateCourseDto } from '../../models/dto/input/update-course.dto';
import { CourseDto } from '../../models/dto/output/course.dto';

export function UpdateCourseDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Update course data',
			description: 'Updates course data by id. image_url must be a valid HTTPS URL when provided.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the course to be updated',
			type: String,
		}),
		ApiBody({
			type: UpdateCourseDto,
			description: 'Data for course update',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Course updated successfully.',
			type: CourseDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for course update.',
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'Course or one or more theme IDs not found.',
			schema: {
				examples: {
					course_not_found: {
						summary: 'Course not found',
						value: { message: 'Curso não encontrado com os critérios: {"id":"..."}' },
					},
					theme_not_found: {
						summary: 'Theme not found',
						value: { message: 'Tema não encontrado com os critérios: {"id":["..."]}' },
					},
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while updating course.',
		}),
	);
}
