import { Inject, Injectable } from '@nestjs/common';
import type { DeleteResult } from 'typeorm';
import type { ThemesRepositoryInterface } from '../../models/interfaces/themes-repository.interface';
import { THEME_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingThemeUseCase } from '../get-existing-theme/get-existing-theme.use-case';

@Injectable()
export class DeleteThemeUseCase {
	constructor(
		@Inject(THEME_REPOSITORY_INTERFACE_KEY)
		private readonly themesRepository: ThemesRepositoryInterface,
		@Inject(GetExistingThemeUseCase)
		private readonly getExistingThemeUseCase: GetExistingThemeUseCase,
	) {}

	async execute(themeId: string): Promise<DeleteResult> {
		await this.getExistingThemeUseCase.execute({ where: { id: themeId } }, { throwIfNotFound: true });

		return await this.themesRepository.delete(themeId);
	}
}
