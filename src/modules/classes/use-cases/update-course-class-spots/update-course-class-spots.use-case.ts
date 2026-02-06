import { Inject, Injectable } from '@nestjs/common';
import type { UpdateResult } from 'typeorm';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingCourseClassUseCase } from '../get-existing-course-class/get-existing-class.use-case';

export type SpotsOperation = 'increment' | 'decrement';

@Injectable()
export class UpdateCourseClassSpotsUseCase {
	constructor(
		@Inject(COURSE_CLASSES_REPOSITORY_INTERFACE_KEY)
		private readonly courseClassesRepository: CourseClassesRepositoryInterface,
		@Inject(GetExistingCourseClassUseCase)
		private readonly getExistingCourseClassUseCase: GetExistingCourseClassUseCase,
	) {}

	async execute(classId: string, operation: SpotsOperation): Promise<UpdateResult> {
		const courseClass = await this.getExistingCourseClassUseCase.execute({ where: { id: classId } }, { throwIfNotFound: true });

		const currentSpots = courseClass?.spots ?? 0;
		const newSpots = operation === 'increment' ? currentSpots + 1 : currentSpots - 1;

		return await this.courseClassesRepository.update(classId, { spots: newSpots });
	}
}
