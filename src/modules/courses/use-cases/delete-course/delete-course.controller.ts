import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { DeleteCourseDocs } from './docs';
import { DeleteCourseUseCase } from './delete-course.use-case';

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
