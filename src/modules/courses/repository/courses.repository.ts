import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllCoursesPaginationDto } from '../models/dto/input/list-all-courses-pagination.dto';
import { Course } from '../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../models/interfaces/courses-repository.interface';

@Injectable()
export class CoursesRepository extends Repository<Course> implements CoursesRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Course, dataSource.createEntityManager());
	}

	async listAllCoursesPaginated({ page = 1, limit = 10, search, themes, status }: ListAllCoursesPaginationDto): Promise<PaginatedResponseDto<Course>> {
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('course').leftJoin('course.classes', 'classes');

		if (search) {
			queryBuilder.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
				search: `%${search}%`,
			});
		}

		if (themes?.length) {
			queryBuilder.andWhere('course.themes && :themes', { themes });
		}

		if (status?.length) {
			queryBuilder.andWhere('classes.status IN (:...status)', { status });
		}

		queryBuilder.skip(skip);
		queryBuilder.take(limit);
		queryBuilder.orderBy('course.created_at', 'DESC');

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
