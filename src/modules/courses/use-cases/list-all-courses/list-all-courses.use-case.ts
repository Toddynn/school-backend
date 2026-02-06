import { Inject, Injectable } from '@nestjs/common';
import type { ListAllCoursesPaginationDto } from '../../models/dto/input/list-all-courses-pagination.dto';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class ListAllCoursesUseCase {
	constructor(
		@Inject(COURSE_REPOSITORY_INTERFACE_KEY)
		private readonly coursesRepository: CoursesRepositoryInterface,
	) {}

	async execute(paginationDto: ListAllCoursesPaginationDto) {
		return await this.coursesRepository.listAllCoursesPaginated(paginationDto);
	}
}
