import { Inject, Injectable } from '@nestjs/common';
import type { FindOneOptions } from 'typeorm';
import { formatWhereClause } from '@/shared/helpers/format-where-clause.helper';
import { normalizeGetExistingOptions } from '@/shared/helpers/normalize-get-existing-options.helper';
import type { GetExistingOptions } from '@/shared/interfaces/get-existing-options';
import { NotFoundThemeException } from '../../errors/not-found-theme.error';
import { ThemeAlreadyExistsException } from '../../errors/theme-already-exists.error';
import type { Theme } from '../../models/entities/theme.entity';
import type { ThemesRepositoryInterface } from '../../models/interfaces/themes-repository.interface';
import { THEME_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class GetExistingThemeUseCase {
	constructor(
		@Inject(THEME_REPOSITORY_INTERFACE_KEY)
		private readonly themesRepository: ThemesRepositoryInterface,
	) {}

	async execute(criteria: FindOneOptions<Theme>, options?: GetExistingOptions): Promise<Theme | null> {
		const { throwIfFound, throwIfNotFound } = normalizeGetExistingOptions(options);
		const fields = formatWhereClause(criteria.where || {});

		const theme = await this.themesRepository.findOne(criteria);

		if (!theme) {
			if (throwIfNotFound) {
				throw new NotFoundThemeException(fields);
			}
			return null;
		}

		if (throwIfFound) {
			throw new ThemeAlreadyExistsException(fields);
		}

		return theme;
	}
}
