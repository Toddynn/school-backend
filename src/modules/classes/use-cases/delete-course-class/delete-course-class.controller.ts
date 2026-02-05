import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { DeleteCourseClassUseCase } from './delete-course-class.use-case';
import { DeleteCourseClassDocs } from './docs';

@ApiTags('Classes')
@Controller('classes')
export class DeleteCourseClassController {
	constructor(
		@Inject(DeleteCourseClassUseCase)
		private readonly deleteCourseClassUseCase: DeleteCourseClassUseCase,
	) {}

	@Delete(':id')
	@DeleteCourseClassDocs()
	async execute(@Param('id') classId: string): Promise<DeleteResult> {
		return await this.deleteCourseClassUseCase.execute(classId);
	}
}
