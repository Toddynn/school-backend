import { Inject, Injectable } from '@nestjs/common';
import type { UpdateCourseDto } from '../../models/dto/input/update-course.dto';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingCourseUseCase } from '../get-existing-course/get-existing-course.use-case';

@Injectable()
export class UpdateCourseUseCase {
	constructor(
		@Inject(COURSE_REPOSITORY_INTERFACE_KEY)
		private readonly coursesRepository: CoursesRepositoryInterface,
		@Inject(GetExistingCourseUseCase)
		private readonly getExistingCourseUseCase: GetExistingCourseUseCase,
	) {}

	async execute(courseId: string, updateCourseDto: UpdateCourseDto) {
		await this.getExistingCourseUseCase.execute({ where: { id: courseId } }, { throwIfNotFound: true });

		return await this.coursesRepository.update(courseId, updateCourseDto);
	}
}
