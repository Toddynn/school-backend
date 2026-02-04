import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateThemeDto } from '../../models/dto/input/create-theme.dto';
import { Theme } from '../../models/entities/theme.entity';
import { CreateThemeUseCase } from './create-theme.use-case';
import { CreateThemeDocs } from './docs';

@ApiTags('Themes')
@Controller('themes')
export class CreateThemeController {
	constructor(
		@Inject(CreateThemeUseCase)
		private readonly createThemeUseCase: CreateThemeUseCase,
	) {}

	@Post()
	@CreateThemeDocs()
	async execute(@Body() createThemeDto: CreateThemeDto): Promise<Theme> {
		return await this.createThemeUseCase.execute(createThemeDto);
	}
}
