import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Theme } from './models/entities/theme.entity';
import { ThemesRepository } from './repository/themes.repository';
import { THEME_REPOSITORY_INTERFACE_KEY } from './shared/constants/repository-interface-key';
import { CreateThemeController } from './use-cases/create-theme/create-theme.controller';
import { CreateThemeUseCase } from './use-cases/create-theme/create-theme.use-case';
import { DeleteThemeController } from './use-cases/delete-theme/delete-theme.controller';
import { DeleteThemeUseCase } from './use-cases/delete-theme/delete-theme.use-case';
import { GetExistingThemeUseCase } from './use-cases/get-existing-theme/get-existing-theme.use-case';
import { UpdateThemeController } from './use-cases/update-theme/update-theme.controller';
import { UpdateThemeUseCase } from './use-cases/update-theme/update-theme.use-case';

@Module({
	imports: [TypeOrmModule.forFeature([Theme])],
	controllers: [CreateThemeController, UpdateThemeController, DeleteThemeController],
	providers: [
		{
			provide: THEME_REPOSITORY_INTERFACE_KEY,
			useFactory: (dataSource: DataSource) => {
				return new ThemesRepository(dataSource);
			},
			inject: [DataSource],
		},
		CreateThemeUseCase,
		GetExistingThemeUseCase,
		UpdateThemeUseCase,
		DeleteThemeUseCase,
	],
	exports: [THEME_REPOSITORY_INTERFACE_KEY, GetExistingThemeUseCase, UpdateThemeUseCase, DeleteThemeUseCase],
})
export class ThemesModule {}
