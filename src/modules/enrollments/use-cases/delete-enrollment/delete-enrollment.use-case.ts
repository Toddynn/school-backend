import { Inject, Injectable } from '@nestjs/common';
import type { DeleteResult } from 'typeorm';
import { UpdateCourseClassSpotsUseCase } from '@/modules/classes/use-cases/update-course-class-spots/update-course-class-spots.use-case';
import type { EnrollmentsRepositoryInterface } from '../../models/interfaces/enrollments-repository.interface';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingEnrollmentUseCase } from '../get-existing-enrollment/get-existing-enrollment.use-case';

@Injectable()
export class DeleteEnrollmentUseCase {
	constructor(
		@Inject(ENROLLMENT_REPOSITORY_INTERFACE_KEY)
		private readonly enrollmentsRepository: EnrollmentsRepositoryInterface,
		@Inject(GetExistingEnrollmentUseCase)
		private readonly getExistingEnrollmentUseCase: GetExistingEnrollmentUseCase,
		@Inject(UpdateCourseClassSpotsUseCase)
		private readonly updateCourseClassSpotsUseCase: UpdateCourseClassSpotsUseCase,
	) {}

	async execute(enrollmentId: string): Promise<DeleteResult> {
		const enrollment = await this.getExistingEnrollmentUseCase.execute({ where: { id: enrollmentId } }, { throwIfNotFound: true });

		const deleteResult = await this.enrollmentsRepository.delete(enrollmentId);

		if (enrollment?.class_id) {
			await this.updateCourseClassSpotsUseCase.execute(enrollment.class_id, 'increment');
		}

		return deleteResult;
	}
}
