import { Inject, Injectable } from '@nestjs/common';
import type { FindOneOptions } from 'typeorm';
import { formatWhereClause } from '@/shared/helpers/format-where-clause.helper';
import { normalizeGetExistingOptions } from '@/shared/helpers/normalize-get-existing-options.helper';
import type { GetExistingOptions } from '@/shared/interfaces/get-existing-options';
import { EnrollmentAlreadyExistsException } from '../../errors/enrollment-already-exists.error';
import { NotFoundEnrollmentException } from '../../errors/not-found-enrollment.error';
import type { Enrollment } from '../../models/entities/enrollment.entity';
import type { EnrollmentsRepositoryInterface } from '../../models/interfaces/enrollments-repository.interface';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class GetExistingEnrollmentUseCase {
	constructor(
		@Inject(ENROLLMENT_REPOSITORY_INTERFACE_KEY)
		private readonly enrollmentsRepository: EnrollmentsRepositoryInterface,
	) {}

	async execute(criteria: FindOneOptions<Enrollment>, options?: GetExistingOptions): Promise<Enrollment | null> {
		const { throwIfFound, throwIfNotFound } = normalizeGetExistingOptions(options);
		const fields = formatWhereClause(criteria.where || {});

		const enrollment = await this.enrollmentsRepository.findOne(criteria);

		if (!enrollment) {
			if (throwIfNotFound) {
				throw new NotFoundEnrollmentException(fields);
			}
			return null;
		}

		if (throwIfFound) {
			throw new EnrollmentAlreadyExistsException(fields);
		}

		return enrollment;
	}
}
