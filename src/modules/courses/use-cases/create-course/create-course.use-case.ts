import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import type { CreateCourseDto } from '../../models/dto/input/create-course.dto';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import type { ThemesRepositoryInterface } from '@/modules/themes/models/interfaces/themes-repository.interface';
import { THEME_REPOSITORY_INTERFACE_KEY } from '@/modules/themes/shared/constants/repository-interface-key';
import { NotFoundThemeException } from '@/modules/themes/errors/not-found-theme.error';

@Injectable()
export class CreateCourseUseCase {
	constructor(
		@Inject(COURSE_REPOSITORY_INTERFACE_KEY)
		private readonly coursesRepository: CoursesRepositoryInterface,
		@Inject(THEME_REPOSITORY_INTERFACE_KEY)
		private readonly themesRepository: ThemesRepositoryInterface,
	) {}

	async execute(createCourseDto: CreateCourseDto): Promise<Course> {
		const themes =
			createCourseDto.theme_ids.length > 0
				? await this.themesRepository.find({ where: { id: In(createCourseDto.theme_ids) } })
				: [];

		if (themes.length !== createCourseDto.theme_ids.length) {
			const foundIds = new Set(themes.map((t) => t.id));
			const missingIds = createCourseDto.theme_ids.filter((id) => !foundIds.has(id));
			throw new NotFoundThemeException(JSON.stringify({ id: missingIds }));
		}

		const course = this.coursesRepository.create({
			title: createCourseDto.title,
			description: createCourseDto.description,
			image_url: createCourseDto.image_url,
		});

		course.themes = themes;

		return await this.coursesRepository.save(course);
	}
}
