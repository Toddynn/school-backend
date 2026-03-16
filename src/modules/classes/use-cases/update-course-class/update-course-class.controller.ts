import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { Roles } from '@/modules/auth/shared/decorators/roles.decorator';
import { Role } from '@/shared/constants/roles';
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
	@Roles(Role.ACCESS)
	@ApiBearerAuth()
	@UpdateCourseClassDocs()
	async execute(@Param('id') courseClassId: string, @Body() updateCourseClassDto: UpdateCourseClassDto): Promise<UpdateResult> {
		return await this.updateCourseClassUseCase.execute(courseClassId, updateCourseClassDto);
	}
}
