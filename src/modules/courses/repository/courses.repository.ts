import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import { CourseClassStatus } from '@/modules/classes/shared/enums/course-class-status.enum';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllCoursesPaginationDto } from '../models/dto/input/list-all-courses-pagination.dto';
import type { CourseWithClassesStatusCounts } from '../models/dto/output/course-with-classes-status-counts.dto';
import { Course } from '../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../models/interfaces/courses-repository.interface';

@Injectable()
export class CoursesRepository extends Repository<Course> implements CoursesRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Course, dataSource.createEntityManager());
	}

	async listAllCoursesPaginated({
		page = 1,
		limit = 10,
		search,
		themes,
		courseClassStatus,
	}: ListAllCoursesPaginationDto): Promise<PaginatedResponseDto<CourseWithClassesStatusCounts>> {
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('course');

		if (search) {
			queryBuilder.andWhere('(course.title ILIKE :search OR course.description ILIKE :search)', {
				search: `%${search}%`,
			});
		}

		if (themes?.length) {
			queryBuilder.andWhere('course.themes && :themes', { themes });
		}

		if (courseClassStatus?.length) {
			queryBuilder.andWhere('EXISTS (SELECT 1 FROM classes c2 WHERE c2.course_id = course.id AND c2.status IN (:...courseClassStatus))', {
				courseClassStatus,
			});
		}

		const total = await queryBuilder.getCount();

		queryBuilder
			.addSelect(
				'(SELECT COUNT(*) FROM classes c WHERE c.course_id = course.id AND c.status = :availableStatus)',
				'available_classes_count',
			)
			.addSelect(
				'(SELECT COUNT(*) FROM classes c WHERE c.course_id = course.id AND c.status = :closedStatus)',
				'closed_classes_count',
			)
			.setParameters({
				availableStatus: CourseClassStatus.AVAILABLE,
				closedStatus: CourseClassStatus.CLOSED,
			});

		queryBuilder.orderBy('course.created_at', 'DESC');
		queryBuilder.skip(skip);
		queryBuilder.take(limit);

		const { entities, raw } = await queryBuilder.getRawAndEntities();

		const data = entities.map((course, index) => ({
			...course,
			classes_count: {
				available_classes_count: Number(raw[index]?.available_classes_count ?? 0),
				closed_classes_count: Number(raw[index]?.closed_classes_count ?? 0),
			},
		}));

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
