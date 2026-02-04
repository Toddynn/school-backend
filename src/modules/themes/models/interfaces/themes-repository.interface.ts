import type { Repository } from 'typeorm';
import type { Theme } from '../entities/theme.entity';

export interface ThemesRepositoryInterface extends Repository<Theme> {}
