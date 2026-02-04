import { Inject, Injectable } from '@nestjs/common';
import type { CreateThemeDto } from '../../models/dto/input/create-theme.dto';
import type { Theme } from '../../models/entities/theme.entity';
import type { ThemesRepositoryInterface } from '../../models/interfaces/themes-repository.interface';
import { THEME_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingThemeUseCase } from '../get-existing-theme/get-existing-theme.use-case';

@Injectable()
export class CreateThemeUseCase {
	constructor(
		@Inject(THEME_REPOSITORY_INTERFACE_KEY)
		private readonly themesRepository: ThemesRepositoryInterface,
		@Inject(GetExistingThemeUseCase)
		private readonly getExistingThemeUseCase: GetExistingThemeUseCase,
	) {}

	async execute(createThemeDto: CreateThemeDto): Promise<Theme> {
		await this.getExistingThemeUseCase.execute({ where: { name: createThemeDto.name } }, { throwIfFound: true });

		const theme = this.themesRepository.create(createThemeDto);

		return await this.themesRepository.save(theme);
	}
}
