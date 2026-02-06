import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEnrollmentDto } from '../../models/dto/input/create-enrollment.dto';
import { Enrollment } from '../../models/entities/enrollment.entity';
import { CreateEnrollmentUseCase } from './create-enrollment.use-case';
import { CreateEnrollmentDocs } from './docs';

@ApiTags('Enrollments')
@Controller('enrollments')
export class CreateEnrollmentController {
	constructor(
		@Inject(CreateEnrollmentUseCase)
		private readonly createEnrollmentUseCase: CreateEnrollmentUseCase,
	) {}

	@Post()
	@CreateEnrollmentDocs()
	async execute(@Body() createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
		return await this.createEnrollmentUseCase.execute(createEnrollmentDto);
	}
}
