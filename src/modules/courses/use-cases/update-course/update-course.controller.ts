import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
	@UpdateCourseDocs()
	async execute(@Param('id') courseId: string, @Body() updateCourseDto: UpdateCourseDto) {
		return await this.updateCourseUseCase.execute(courseId, updateCourseDto);
	}
}
