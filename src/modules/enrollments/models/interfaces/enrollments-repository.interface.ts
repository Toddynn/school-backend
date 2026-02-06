import type { Repository } from 'typeorm';
import type { Enrollment } from '../entities/enrollment.entity';

export interface EnrollmentsRepositoryInterface extends Repository<Enrollment> {}
