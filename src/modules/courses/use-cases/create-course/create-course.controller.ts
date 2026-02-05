import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCourseDto } from '../../models/dto/input/create-course.dto';
import { Course } from '../../models/entities/course.entity';
import { CreateCourseUseCase } from './create-course.use-case';
import { CreateCourseDocs } from './docs';

@ApiTags('Courses')
@Controller('courses')
export class CreateCourseController {
	constructor(
		@Inject(CreateCourseUseCase)
		private readonly createCourseUseCase: CreateCourseUseCase,
	) {}

	@Post()
	@CreateCourseDocs()
	async execute(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
		return await this.createCourseUseCase.execute(createCourseDto);
	}
}
