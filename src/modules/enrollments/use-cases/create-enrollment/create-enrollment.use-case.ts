import { Inject, Injectable } from '@nestjs/common';
import { CourseClassStatus } from '@/modules/classes/shared/enums/course-class-status.enum';
import { GetExistingCourseClassUseCase } from '@/modules/classes/use-cases/get-existing-course-class/get-existing-class.use-case';
import { UpdateCourseClassSpotsUseCase } from '@/modules/classes/use-cases/update-course-class-spots/update-course-class-spots.use-case';
import { CourseClassFullException } from '../../errors/course-class-full.error';
import { CourseClassNotAvailableException } from '../../errors/course-class-not-available.error';
import { CourseClassOutOfRangeException } from '../../errors/course-class-out-of-range.error';
import { UserAlreadyEnrolledInCourseException } from '../../errors/user-already-enrolled-in-course.error';
import type { CreateEnrollmentDto } from '../../models/dto/input/create-enrollment.dto';
import type { Enrollment } from '../../models/entities/enrollment.entity';
import type { EnrollmentsRepositoryInterface } from '../../models/interfaces/enrollments-repository.interface';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingEnrollmentUseCase } from '../get-existing-enrollment/get-existing-enrollment.use-case';

@Injectable()
export class CreateEnrollmentUseCase {
	constructor(
		@Inject(ENROLLMENT_REPOSITORY_INTERFACE_KEY)
		private readonly enrollmentsRepository: EnrollmentsRepositoryInterface,
		@Inject(GetExistingEnrollmentUseCase)
		private readonly getExistingEnrollmentUseCase: GetExistingEnrollmentUseCase,
		@Inject(GetExistingCourseClassUseCase)
		private readonly getExistingCourseClassUseCase: GetExistingCourseClassUseCase,
		@Inject(UpdateCourseClassSpotsUseCase)
		private readonly updateCourseClassSpotsUseCase: UpdateCourseClassSpotsUseCase,
	) {}

	async execute(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
		const courseClass = await this.getExistingCourseClassUseCase.execute({ where: { id: createEnrollmentDto.class_id } }, { throwIfNotFound: true });

		if (courseClass?.status !== CourseClassStatus.AVAILABLE) {
			throw new CourseClassNotAvailableException();
		}

		if (courseClass?.start_date > new Date() || courseClass?.end_date < new Date()) {
			throw new CourseClassOutOfRangeException();
		}

		if (courseClass?.spots <= 0) {
			throw new CourseClassFullException();
		}

		await this.getExistingEnrollmentUseCase.execute(
			{
				where: {
					user_id: createEnrollmentDto.user_id,
					class_id: createEnrollmentDto.class_id,
				},
			},
			{ throwIfFound: true },
		);

		await this.validateUserNotEnrolledInCourse(createEnrollmentDto.user_id, courseClass.course_id);

		const enrollment = this.enrollmentsRepository.create(createEnrollmentDto);
		const savedEnrollment = await this.enrollmentsRepository.save(enrollment);

		await this.updateCourseClassSpotsUseCase.execute(createEnrollmentDto.class_id, 'decrement');

		return savedEnrollment;
	}

	private async validateUserNotEnrolledInCourse(userId: string, courseId: string): Promise<void> {
		const existingEnrollment = await this.getExistingEnrollmentUseCase.execute(
			{
				where: {
					user_id: userId,
					course_class: {
						course_id: courseId,
					},
				},
			},
			{ throwIfFound: false, throwIfNotFound: false },
		);

		if (existingEnrollment) {
			throw new UserAlreadyEnrolledInCourseException();
		}
	}
}
