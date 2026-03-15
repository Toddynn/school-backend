import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetExistingCourseClassDocs } from './docs';
import { GetExistingCourseClassUseCase } from './get-existing-class.use-case';

@ApiTags('Classes')
@Controller('classes')
export class GetExistingCourseClassController {
	constructor(
		@Inject(GetExistingCourseClassUseCase)
		private readonly getExistingCourseClassUseCase: GetExistingCourseClassUseCase,
	) {}

	@Get(':id')
	@GetExistingCourseClassDocs()
	async execute(@Param('id', ParseUUIDPipe) classId: string) {
		return await this.getExistingCourseClassUseCase.execute({ where: { id: classId }, relations: ['course'] }, { throwIfNotFound: true });
	}
}
