import type { Repository } from 'typeorm';
import type { User } from '../entities/user.entity';

export interface UsersRepositoryInterface extends Repository<User> {}
