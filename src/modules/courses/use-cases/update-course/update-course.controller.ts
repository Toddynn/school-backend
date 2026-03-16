import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
import { UpdateCourseDto } from '../../models/dto/input/update-course.dto';
import { UpdateCourseDocs } from './docs';
import { UpdateCourseUseCase } from './update-course.use-case';

@ApiTags('Courses')
@Controller('courses')
export class UpdateCourseController {
	constructor(
		@Inject(UpdateCourseUseCase)
		private readonly updateCourseUseCase: UpdateCourseUseCase,
	) {}

	@Patch(':id')
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@UpdateCourseDocs()
	async execute(@Param('id') courseId: string, @Body() updateCourseDto: UpdateCourseDto) {
		return await this.updateCourseUseCase.execute(courseId, updateCourseDto);
	}
}
