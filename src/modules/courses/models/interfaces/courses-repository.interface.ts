import type { Repository } from 'typeorm';
import type { PaginatedResponseDto, PaginationDto } from '@/shared/dto/pagination.dto';
import type { Course } from '../entities/course.entity';

export interface CoursesRepositoryInterface extends Repository<Course> {
	listAllCoursesWithAvailableClasses(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Course>>;
}
