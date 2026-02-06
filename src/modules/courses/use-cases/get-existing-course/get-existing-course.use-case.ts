import { Inject, Injectable } from '@nestjs/common';
import type { FindOneOptions } from 'typeorm';
import { formatWhereClause } from '@/shared/helpers/format-where-clause.helper';
import { normalizeGetExistingOptions } from '@/shared/helpers/normalize-get-existing-options.helper';
import type { GetExistingOptions } from '@/shared/interfaces/get-existing-options';
import { CourseAlreadyExistsException } from '../../errors/course-already-exists.error';
import { NotFoundCourseException } from '../../errors/not-found-course.error';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class GetExistingCourseUseCase {
	constructor(
		@Inject(COURSE_REPOSITORY_INTERFACE_KEY)
		private readonly coursesRepository: CoursesRepositoryInterface,
	) {}

	async execute(criteria: FindOneOptions<Course>, options?: GetExistingOptions): Promise<Course | null> {
		const { throwIfFound, throwIfNotFound } = normalizeGetExistingOptions(options);
		const fields = formatWhereClause(criteria.where || {});

		const course = await this.coursesRepository.findOne(criteria);

		if (!course) {
			if (throwIfNotFound) {
				throw new NotFoundCourseException(fields);
			}
			return null;
		}

		if (throwIfFound) {
			throw new CourseAlreadyExistsException(fields);
		}

		return course;
	}
}
