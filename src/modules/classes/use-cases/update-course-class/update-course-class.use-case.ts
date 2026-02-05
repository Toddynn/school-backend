import { Inject, Injectable } from '@nestjs/common';
import type { UpdateResult } from 'typeorm';
import { GetExistingCourseUseCase } from '@/modules/courses/use-cases/get-existing-course/get-existing-course.use-case';
import type { UpdateCourseClassDto } from '../../models/dto/input/update-course-class.dto';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingCourseClassUseCase } from '../get-existing-course-class/get-existing-class.use-case';

@Injectable()
export class UpdateCourseClassUseCase {
	constructor(
		@Inject(COURSE_CLASSES_REPOSITORY_INTERFACE_KEY)
		private readonly classesRepository: CourseClassesRepositoryInterface,
		@Inject(GetExistingCourseClassUseCase)
		private readonly getExistingCourseClassUseCase: GetExistingCourseClassUseCase,
		@Inject(GetExistingCourseUseCase)
		private readonly getExistingCourseUseCase: GetExistingCourseUseCase,
	) {}

	async execute(classId: string, updateClassDto: UpdateCourseClassDto): Promise<UpdateResult> {
		await this.getExistingCourseClassUseCase.execute({ where: { id: classId } }, { throwIfNotFound: true });

		if (updateClassDto.course_id !== undefined) {
			await this.getExistingCourseUseCase.execute({ where: { id: updateClassDto.course_id } }, { throwIfNotFound: true });
		}

		return await this.classesRepository.update(classId, updateClassDto);
	}
}
