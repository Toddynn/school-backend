import type { Repository } from 'typeorm';
import type { PaginatedResponseDto, PaginationDto } from '@/shared/dto/pagination.dto';
import type { User } from '../entities/user.entity';

export interface UsersRepositoryInterface extends Repository<User> {
	listAllUsersPaginated(paginationDto: PaginationDto): Promise<PaginatedResponseDto<User>>;
}
