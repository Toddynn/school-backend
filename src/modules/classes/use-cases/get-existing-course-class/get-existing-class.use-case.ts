import { Inject, Injectable } from '@nestjs/common';
import type { FindOneOptions } from 'typeorm';
import { formatWhereClause } from '@/shared/helpers/format-where-clause.helper';
import { normalizeGetExistingOptions } from '@/shared/helpers/normalize-get-existing-options.helper';
import type { GetExistingOptions } from '@/shared/interfaces/get-existing-options';
import { ClassAlreadyExistsException } from '../../errors/class-already-exists.error';
import { NotFoundClassException } from '../../errors/not-found-class.error';
import type { CourseClass } from '../../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class GetExistingCourseClassUseCase {
	constructor(
		@Inject(COURSE_CLASSES_REPOSITORY_INTERFACE_KEY)
		private readonly courseClassesRepository: CourseClassesRepositoryInterface,
	) {}

	async execute(criteria: FindOneOptions<CourseClass>, options?: GetExistingOptions): Promise<CourseClass | null> {
		const { throwIfFound, throwIfNotFound } = normalizeGetExistingOptions(options);
		const fields = formatWhereClause(criteria.where || {});

		const classEntity = await this.courseClassesRepository.findOne(criteria);

		if (!classEntity) {
			if (throwIfNotFound) {
				throw new NotFoundClassException(fields);
			}
			return null;
		}

		if (throwIfFound) {
			throw new ClassAlreadyExistsException(fields);
		}

		return classEntity;
	}
}
