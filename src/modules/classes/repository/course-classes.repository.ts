import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllClassesPaginationDto } from '../models/dto/input/list-all-classes-pagination.dto';
import { CourseClass } from '../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../models/interfaces/course-classes-repository.interface';

@Injectable()
export class CourseClassesRepository extends Repository<CourseClass> implements CourseClassesRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(CourseClass, dataSource.createEntityManager());
	}

	async listAllClassesPaginated({
		page = 1,
		limit = 10,
		search,
		course_id,
		status,
		start_date,
		end_date,
	}: ListAllClassesPaginationDto): Promise<PaginatedResponseDto<CourseClass>> {
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('class').leftJoinAndSelect('class.course', 'course');

		if (course_id) {
			queryBuilder.andWhere('class.course_id = :course_id', { course_id });
		}

		if (search) {
			queryBuilder.andWhere('(class.title ILIKE :search OR class.description ILIKE :search)', {
				search: `%${search}%`,
			});
		}

		if (status?.length) {
			queryBuilder.andWhere('class.status IN (:...status)', { status });
		}

		if (start_date) {
			queryBuilder.andWhere('class.start_date >= :start_date', { start_date });
		}

		if (end_date) {
			queryBuilder.andWhere('class.end_date <= :end_date', { end_date });
		}

		queryBuilder.skip(skip);
		queryBuilder.take(limit);
		queryBuilder.orderBy('class.created_at', 'DESC');

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
