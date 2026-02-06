import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllEnrollmentsPaginationDto } from '../models/dto/input/list-all-enrollments-pagination.dto';
import { Enrollment } from '../models/entities/enrollment.entity';
import type { EnrollmentsRepositoryInterface } from '../models/interfaces/enrollments-repository.interface';

@Injectable()
export class EnrollmentsRepository extends Repository<Enrollment> implements EnrollmentsRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Enrollment, dataSource.createEntityManager());
	}

	async listAllEnrollmentsPaginated({
		page = 1,
		limit = 10,
		user_id,
		class_id,
		course_id,
	}: ListAllEnrollmentsPaginationDto): Promise<PaginatedResponseDto<Enrollment>> {
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('enrollment')
			.leftJoinAndSelect('enrollment.user', 'user')
			.leftJoinAndSelect('enrollment.course_class', 'course_class')
			.leftJoinAndSelect('course_class.course', 'course');

		if (user_id) {
			queryBuilder.andWhere('enrollment.user_id = :user_id', { user_id });
		}

		if (class_id) {
			queryBuilder.andWhere('enrollment.class_id = :class_id', { class_id });
		}

		if (course_id) {
			queryBuilder.andWhere('course_class.course_id = :course_id', { course_id });
		}

		queryBuilder.skip(skip);
		queryBuilder.take(limit);
		queryBuilder.orderBy('enrollment.enrolled_at', 'DESC');

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
