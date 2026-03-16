import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
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
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@DeleteCourseDocs()
	async execute(@Param('id') courseId: string): Promise<DeleteResult> {
		return await this.deleteCourseUseCase.execute(courseId);
	}
}
