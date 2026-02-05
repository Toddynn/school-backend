import { Inject, Injectable } from '@nestjs/common';
import type { DeleteResult } from 'typeorm';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingCourseClassUseCase } from '../get-existing-course-class/get-existing-class.use-case';

@Injectable()
export class DeleteCourseClassUseCase {
	constructor(
		@Inject(COURSE_CLASSES_REPOSITORY_INTERFACE_KEY)
		private readonly courseClassesRepository: CourseClassesRepositoryInterface,
		@Inject(GetExistingCourseClassUseCase)
		private readonly getExistingCourseClassUseCase: GetExistingCourseClassUseCase,
	) {}

	async execute(courseClassId: string): Promise<DeleteResult> {
		await this.getExistingCourseClassUseCase.execute({ where: { id: courseClassId } }, { throwIfNotFound: true });

		return await this.courseClassesRepository.delete(courseClassId);
	}
}
