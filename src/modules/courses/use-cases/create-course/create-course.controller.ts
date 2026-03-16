import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
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
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@CreateCourseDocs()
	async execute(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
		return await this.createCourseUseCase.execute(createCourseDto);
	}
}
