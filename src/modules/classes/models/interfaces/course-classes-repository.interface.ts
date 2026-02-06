import type { Repository } from 'typeorm';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllClassesPaginationDto } from '../dto/input/list-all-classes-pagination.dto';
import type { CourseClass } from '../entities/course-class.entity';

export interface CourseClassesRepositoryInterface extends Repository<CourseClass> {
	listAllClassesPaginated(paginationDto: ListAllClassesPaginationDto): Promise<PaginatedResponseDto<CourseClass>>;
}
