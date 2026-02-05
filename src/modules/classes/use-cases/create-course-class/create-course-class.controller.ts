import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCourseClassDto } from '../../models/dto/input/create-course-class.dto';
import { CourseClass } from '../../models/entities/course-class.entity';
import { CreateCourseClassUseCase } from './create-course-class.use-case';
import { CreateCourseClassDocs } from './docs';

@ApiTags('Classes')
@Controller('classes')
export class CreateCourseClassController {
	constructor(
		@Inject(CreateCourseClassUseCase)
		private readonly createCourseClassUseCase: CreateCourseClassUseCase,
	) {}

	@Post()
	@CreateCourseClassDocs()
	async execute(@Body() createCourseClassDto: CreateCourseClassDto): Promise<CourseClass> {
		return await this.createCourseClassUseCase.execute(createCourseClassDto);
	}
}
