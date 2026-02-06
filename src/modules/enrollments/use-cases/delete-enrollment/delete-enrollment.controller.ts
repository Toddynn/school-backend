import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { DeleteEnrollmentUseCase } from './delete-enrollment.use-case';
import { DeleteEnrollmentDocs } from './docs';

@ApiTags('Enrollments')
@Controller('enrollments')
export class DeleteEnrollmentController {
	constructor(
		@Inject(DeleteEnrollmentUseCase)
		private readonly deleteEnrollmentUseCase: DeleteEnrollmentUseCase,
	) {}

	@Delete(':id')
	@DeleteEnrollmentDocs()
	async execute(@Param('id') enrollmentId: string): Promise<DeleteResult> {
		return await this.deleteEnrollmentUseCase.execute(enrollmentId);
	}
}
