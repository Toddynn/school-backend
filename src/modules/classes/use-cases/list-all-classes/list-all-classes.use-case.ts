import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { Enrollment } from '@/modules/enrollments/models/entities/enrollment.entity';
import type { ListAllClassesPaginationDto } from '../../models/dto/input/list-all-classes-pagination.dto';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';

@Injectable()
export class ListAllClassesUseCase {
	constructor(
		@Inject(COURSE_CLASSES_REPOSITORY_INTERFACE_KEY)
		private readonly courseClassesRepository: CourseClassesRepositoryInterface,
		@InjectDataSource()
		private readonly dataSource: DataSource,
	) {}

	async execute(paginationDto: ListAllClassesPaginationDto) {
		const result = await this.courseClassesRepository.listAllClassesPaginated(paginationDto);

		if (!paginationDto.current_user_id || !result.data.length) {
			return {
				...result,
				data: result.data.map((c) => ({ ...c, current_user_enrollment_id: null })),
			};
		}

		const classIds = result.data.map((c) => c.id);

		const enrollments = await this.dataSource.getRepository(Enrollment).find({
			where: { user_id: paginationDto.current_user_id, class_id: In(classIds) },
			select: ['id', 'class_id'],
		});

		const enrollmentByClassId = new Map(enrollments.map((e) => [e.class_id, e.id]));

		return {
			...result,
			data: result.data.map((c) => ({
				...c,
				current_user_enrollment_id: enrollmentByClassId.get(c.id) ?? null,
			})),
		};
	}
}
