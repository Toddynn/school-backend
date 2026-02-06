import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import { CourseClassStatus } from '@/modules/classes/shared/enums/course-class-status.enum';
import type { PaginatedResponseDto, PaginationDto } from '@/shared/dto/pagination.dto';
import { Course } from '../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../models/interfaces/courses-repository.interface';

@Injectable()
export class CoursesRepository extends Repository<Course> implements CoursesRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Course, dataSource.createEntityManager());
	}

	async listAllCoursesWithAvailableClasses({ page = 1, limit = 10, search }: PaginationDto): Promise<PaginatedResponseDto<Course>> {
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('course');
		queryBuilder.where('course.status = :status', { status: CourseClassStatus.AVAILABLE });

		if (search) {
			queryBuilder.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
				search: `%${search}%`,
			});
		}

		queryBuilder.leftJoinAndSelect('customer.organization', 'organization');
		queryBuilder.leftJoinAndSelect('customer.user', 'user');
		queryBuilder.skip(skip);
		queryBuilder.take(limit);
		queryBuilder.orderBy('customer.created_at', 'DESC');

		const [data, total] = await queryBuilder.getManyAndCount();

		const total_pages = Math.ceil(total / limit);

		return {
			data,
			page,
			limit,
			total,
			total_pages,
		};
	}
}
