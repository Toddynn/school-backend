import type { Repository } from 'typeorm';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllCoursesPaginationDto } from '../dto/input/list-all-courses-pagination.dto';
import type { Course } from '../entities/course.entity';

export interface CoursesRepositoryInterface extends Repository<Course> {
	listAllCoursesPaginated(paginationDto: ListAllCoursesPaginationDto): Promise<PaginatedResponseDto<Course>>;
}
