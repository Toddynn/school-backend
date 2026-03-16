import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
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
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@DeleteCourseClassDocs()
	async execute(@Param('id') classId: string): Promise<DeleteResult> {
		return await this.deleteCourseClassUseCase.execute(classId);
	}
}
