import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListAllClassesPaginationDto } from '../../models/dto/input/list-all-classes-pagination.dto';
import { ListAllClassesDocs } from './docs';
import { ListAllClassesUseCase } from './list-all-classes.use-case';

@ApiTags('Classes')
@Controller('classes')
export class ListAllClassesController {
	constructor(
		@Inject(ListAllClassesUseCase)
		private readonly listAllClassesUseCase: ListAllClassesUseCase,
	) {}

	@Get('/paginated')
	@ListAllClassesDocs()
	async execute(@Query() paginationDto: ListAllClassesPaginationDto) {
		return await this.listAllClassesUseCase.execute(paginationDto);
	}
}
