import { Inject, Injectable } from '@nestjs/common';
import type { DeleteResult } from 'typeorm';
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
	) {}

	async execute(enrollmentId: string): Promise<DeleteResult> {
		await this.getExistingEnrollmentUseCase.execute({ where: { id: enrollmentId } }, { throwIfNotFound: true });

		return await this.enrollmentsRepository.delete(enrollmentId);
	}
}
