import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
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
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@CreateCourseClassDocs()
	async execute(@Body() createCourseClassDto: CreateCourseClassDto): Promise<CourseClass> {
		return await this.createCourseClassUseCase.execute(createCourseClassDto);
	}
}
