import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { UpdateCourseClassDto } from '../../models/dto/input/update-course-class.dto';
import { UpdateCourseClassDocs } from './docs';
import { UpdateCourseClassUseCase } from './update-course-class.use-case';

@ApiTags('Classes')
@Controller('classes')
export class UpdateCourseClassController {
	constructor(
		@Inject(UpdateCourseClassUseCase)
		private readonly updateCourseClassUseCase: UpdateCourseClassUseCase,
	) {}

	@Patch(':id')
	@UpdateCourseClassDocs()
	async execute(@Param('id') courseClassId: string, @Body() updateCourseClassDto: UpdateCourseClassDto): Promise<UpdateResult> {
		return await this.updateCourseClassUseCase.execute(courseClassId, updateCourseClassDto);
	}
}
