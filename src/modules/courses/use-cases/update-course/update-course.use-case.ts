import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import type { UpdateCourseDto } from '../../models/dto/input/update-course.dto';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingCourseUseCase } from '../get-existing-course/get-existing-course.use-case';
import type { ThemesRepositoryInterface } from '@/modules/themes/models/interfaces/themes-repository.interface';
import { THEME_REPOSITORY_INTERFACE_KEY } from '@/modules/themes/shared/constants/repository-interface-key';
import { NotFoundThemeException } from '@/modules/themes/errors/not-found-theme.error';

@Injectable()
export class UpdateCourseUseCase {
	constructor(
		@Inject(COURSE_REPOSITORY_INTERFACE_KEY)
		private readonly coursesRepository: CoursesRepositoryInterface,
		@Inject(GetExistingCourseUseCase)
		private readonly getExistingCourseUseCase: GetExistingCourseUseCase,
		@Inject(THEME_REPOSITORY_INTERFACE_KEY)
		private readonly themesRepository: ThemesRepositoryInterface,
	) {}

	async execute(courseId: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
		const course = await this.getExistingCourseUseCase.execute(
			{ where: { id: courseId }, relations: ['themes'] },
			{ throwIfNotFound: true },
		);

		if (!course) {
			throw new Error('Unreachable');
		}

		if (updateCourseDto.title !== undefined) course.title = updateCourseDto.title;
		if (updateCourseDto.description !== undefined) course.description = updateCourseDto.description;
		if (updateCourseDto.image_url !== undefined) course.image_url = updateCourseDto.image_url;

		if (updateCourseDto.theme_ids !== undefined) {
			const themes =
				updateCourseDto.theme_ids.length > 0
					? await this.themesRepository.find({ where: { id: In(updateCourseDto.theme_ids) } })
					: [];

			if (themes.length !== updateCourseDto.theme_ids.length) {
				const foundIds = new Set(themes.map((t) => t.id));
				const missingIds = updateCourseDto.theme_ids.filter((id) => !foundIds.has(id));
				throw new NotFoundThemeException(JSON.stringify({ id: missingIds }));
			}

			course.themes = themes;
		}

		return await this.coursesRepository.save(course);
	}
}
