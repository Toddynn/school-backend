import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import { Theme } from '../models/entities/theme.entity';
import type { ThemesRepositoryInterface } from '../models/interfaces/themes-repository.interface';

@Injectable()
export class ThemesRepository extends Repository<Theme> implements ThemesRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Theme, dataSource.createEntityManager());
	}
}
