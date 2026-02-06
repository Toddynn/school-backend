import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateEnrollmentDto } from '../../models/dto/input/create-enrollment.dto';
import { EnrollmentDto } from '../../models/dto/output/enrollment.dto';

export function CreateEnrollmentDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new enrollment',
			description:
				'Enrolls a user in a class. A user cannot be enrolled in the same class twice or in more than one class of the same course.',
		}),
		ApiBody({
			type: CreateEnrollmentDto,
			description: 'Data for enrollment creation',
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: 'Enrollment created successfully.',
			type: EnrollmentDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'User is already enrolled in this class or in another class of the same course.',
			schema: {
				examples: {
					already_enrolled_in_class: {
						summary: 'User already enrolled in this class',
						value: {
							message: 'Matrícula já existe com os critérios: {"user_id":"...","class_id":"..."}',
						},
					},
					already_enrolled_in_course: {
						summary: 'User already enrolled in another class of the same course',
						value: {
							message: 'Usuário {user_id} já está matriculado em uma classe do curso {course_id}',
						},
					},
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'Class not found.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating enrollment.',
		}),
	);
}
