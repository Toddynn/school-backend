import { Body, Controller, Inject, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateResult } from 'typeorm';
import { UpdateThemeDto } from '../../models/dto/input/update-theme.dto';
import { UpdateThemeDocs } from './docs';
import { UpdateThemeUseCase } from './update-theme.use-case';

@ApiTags('Themes')
@Controller('themes')
export class UpdateThemeController {
	constructor(
		@Inject(UpdateThemeUseCase)
		private readonly updateThemeUseCase: UpdateThemeUseCase,
	) {}

	@Patch(':id')
	@UpdateThemeDocs()
	async execute(@Param('id') themeId: string, @Body() updateThemeDto: UpdateThemeDto): Promise<UpdateResult> {
		return await this.updateThemeUseCase.execute(themeId, updateThemeDto);
	}
}
