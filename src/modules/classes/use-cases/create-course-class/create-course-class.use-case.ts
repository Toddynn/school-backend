import { Inject, Injectable } from '@nestjs/common';
import { GetExistingCourseUseCase } from '@/modules/courses/use-cases/get-existing-course/get-existing-course.use-case';
import type { CreateCourseClassDto } from '../../models/dto/input/create-course-class.dto';
import type { CourseClass } from '../../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class CreateCourseClassUseCase {
	constructor(
		@Inject(COURSE_CLASSES_REPOSITORY_INTERFACE_KEY)
		private readonly classesRepository: CourseClassesRepositoryInterface,
		@Inject(GetExistingCourseUseCase)
		private readonly getExistingCourseUseCase: GetExistingCourseUseCase,
	) {}

	async execute(createCourseClassDto: CreateCourseClassDto): Promise<CourseClass> {
		await this.getExistingCourseUseCase.execute({ where: { id: createCourseClassDto.course_id } }, { throwIfNotFound: true });

		const classEntity = this.classesRepository.create(createCourseClassDto);

		return await this.classesRepository.save(classEntity);
	}
}
