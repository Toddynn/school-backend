import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetExistingCourseDocs } from './docs';
import { GetExistingCourseUseCase } from './get-existing-course.use-case';

@ApiTags('Courses')
@Controller('courses')
export class GetExistingCourseController {
	constructor(
		@Inject(GetExistingCourseUseCase)
		private readonly getExistingCourseUseCase: GetExistingCourseUseCase,
	) {}

	@Get(':id')
	@GetExistingCourseDocs()
	async execute(@Param('id', ParseUUIDPipe) courseId: string) {
		return await this.getExistingCourseUseCase.execute({ where: { id: courseId } }, { throwIfNotFound: true });
	}
}
