import { Controller, Delete, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { DeleteThemeDocs } from './docs';
import { DeleteThemeUseCase } from './delete-theme.use-case';

@ApiTags('Themes')
@Controller('themes')
export class DeleteThemeController {
	constructor(
		@Inject(DeleteThemeUseCase)
		private readonly deleteThemeUseCase: DeleteThemeUseCase,
	) {}

	@Delete(':id')
	@DeleteThemeDocs()
	async execute(@Param('id') themeId: string): Promise<DeleteResult> {
		return await this.deleteThemeUseCase.execute(themeId);
	}
}
