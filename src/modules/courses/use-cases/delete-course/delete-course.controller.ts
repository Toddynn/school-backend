import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { DeleteCourseUseCase } from './delete-course.use-case';
import { DeleteCourseDocs } from './docs';

@ApiTags('Courses')
@Controller('courses')
export class DeleteCourseController {
	constructor(
		@Inject(DeleteCourseUseCase)
		private readonly deleteCourseUseCase: DeleteCourseUseCase,
	) {}

	@Delete(':id')
	@DeleteCourseDocs()
	async execute(@Param('id') courseId: string): Promise<DeleteResult> {
		return await this.deleteCourseUseCase.execute(courseId);
	}
}
