import { Inject, Injectable } from '@nestjs/common';
import type { CreateCourseDto } from '../../models/dto/input/create-course.dto';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class CreateCourseUseCase {
	constructor(
		@Inject(COURSE_REPOSITORY_INTERFACE_KEY)
		private readonly coursesRepository: CoursesRepositoryInterface,
	) {}

	async execute(createCourseDto: CreateCourseDto): Promise<Course> {
		const course = this.coursesRepository.create(createCourseDto);

		return await this.coursesRepository.save(course);
	}
}
