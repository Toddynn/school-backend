import type { Repository } from 'typeorm';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllEnrollmentsPaginationDto } from '../dto/input/list-all-enrollments-pagination.dto';
import type { Enrollment } from '../entities/enrollment.entity';

export interface EnrollmentsRepositoryInterface extends Repository<Enrollment> {
	listAllEnrollmentsPaginated(paginationDto: ListAllEnrollmentsPaginationDto): Promise<PaginatedResponseDto<Enrollment>>;
}
