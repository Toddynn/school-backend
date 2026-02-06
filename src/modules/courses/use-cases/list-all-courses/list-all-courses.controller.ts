import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListAllCoursesPaginationDto } from '../../models/dto/input/list-all-courses-pagination.dto';
import { ListAllCoursesDocs } from './docs';
import { ListAllCoursesUseCase } from './list-all-courses.use-case';

@ApiTags('Courses')
@Controller('courses')
export class ListAllCoursesController {
	constructor(
		@Inject(ListAllCoursesUseCase)
		private readonly listAllCoursesUseCase: ListAllCoursesUseCase,
	) {}

	@Get('/paginated')
	@ListAllCoursesDocs()
	async execute(@Query() paginationDto: ListAllCoursesPaginationDto) {
		return await this.listAllCoursesUseCase.execute(paginationDto);
	}
}
