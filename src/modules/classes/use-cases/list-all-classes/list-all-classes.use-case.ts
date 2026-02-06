import { Inject, Injectable } from '@nestjs/common';
import type { ListAllClassesPaginationDto } from '../../models/dto/input/list-all-classes-pagination.dto';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class ListAllClassesUseCase {
	constructor(
		@Inject(COURSE_CLASSES_REPOSITORY_INTERFACE_KEY)
		private readonly courseClassesRepository: CourseClassesRepositoryInterface,
	) {}

	async execute(paginationDto: ListAllClassesPaginationDto) {
		return await this.courseClassesRepository.listAllClassesPaginated(paginationDto);
	}
}
