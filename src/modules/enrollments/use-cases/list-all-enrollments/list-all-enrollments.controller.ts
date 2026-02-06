import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListAllEnrollmentsPaginationDto } from '../../models/dto/input/list-all-enrollments-pagination.dto';
import { ListAllEnrollmentsDocs } from './docs';
import { ListAllEnrollmentsUseCase } from './list-all-enrollments.use-case';

@ApiTags('Enrollments')
@Controller('enrollments')
export class ListAllEnrollmentsController {
	constructor(
		@Inject(ListAllEnrollmentsUseCase)
		private readonly listAllEnrollmentsUseCase: ListAllEnrollmentsUseCase,
	) {}

	@Get('/paginated')
	@ListAllEnrollmentsDocs()
	async execute(@Query() paginationDto: ListAllEnrollmentsPaginationDto) {
		return await this.listAllEnrollmentsUseCase.execute(paginationDto);
	}
}
