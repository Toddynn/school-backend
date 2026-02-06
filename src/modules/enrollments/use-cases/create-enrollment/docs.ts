import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotFoundClassException } from '@/modules/classes/errors/not-found-class.error';
import { getExceptionResponseSchema, getGroupedExceptionResponseSchema } from '@/shared/helpers/exception-response-schema.helper';
import { CourseClassNotAvailableException } from '../../errors/course-class-not-available.error';
import { CourseClassOutOfRangeException } from '../../errors/course-class-out-of-range.error';
import { EnrollmentAlreadyExistsException } from '../../errors/enrollment-already-exists.error';
import { UserAlreadyEnrolledInCourseException } from '../../errors/user-already-enrolled-in-course.error';
import { CreateEnrollmentDto } from '../../models/dto/input/create-enrollment.dto';
import { EnrollmentDto } from '../../models/dto/output/enrollment.dto';

export function CreateEnrollmentDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new enrollment',
			description: 'Enrolls a user in a class. A user cannot be enrolled in the same class twice or in more than one class of the same course.',
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
		ApiResponse(
			getGroupedExceptionResponseSchema(
				[
					{
						exception: EnrollmentAlreadyExistsException,
						args: ['{"user_id":"...","class_id":"..."}'],
						summary: 'User already enrolled in this class',
					},
					{
						exception: UserAlreadyEnrolledInCourseException,
						args: ['user-id', 'course-id'],
						summary: 'User already enrolled in another class of the same course',
					},
					{
						exception: CourseClassNotAvailableException,
						args: [],
						summary: 'Class is not available for enrollment',
					},
					{
						exception: CourseClassOutOfRangeException,
						args: [],
						summary: 'Class is out of enrollment period',
					},
				],
				{ description: 'Conflict with current state of the resource' },
			),
		),
		ApiResponse(getExceptionResponseSchema(NotFoundClassException, ['{"id":"..."}'])),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating enrollment.',
		}),
	);
}
