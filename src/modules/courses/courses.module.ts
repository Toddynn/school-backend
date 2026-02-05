import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Course } from './models/entities/course.entity';
import { CoursesRepository } from './repository/courses.repository';
import { COURSE_REPOSITORY_INTERFACE_KEY } from './shared/constants/repository-interface-key';
import { CreateCourseController } from './use-cases/create-course/create-course.controller';
import { CreateCourseUseCase } from './use-cases/create-course/create-course.use-case';
import { DeleteCourseController } from './use-cases/delete-course/delete-course.controller';
import { DeleteCourseUseCase } from './use-cases/delete-course/delete-course.use-case';
import { GetExistingCourseUseCase } from './use-cases/get-existing-course/get-existing-course.use-case';
import { UpdateCourseController } from './use-cases/update-course/update-course.controller';
import { UpdateCourseUseCase } from './use-cases/update-course/update-course.use-case';
import { ThemesModule } from '../themes/themes.module';

@Module({
	imports: [TypeOrmModule.forFeature([Course]), ThemesModule],
	controllers: [CreateCourseController, UpdateCourseController, DeleteCourseController],
	providers: [
		{
			provide: COURSE_REPOSITORY_INTERFACE_KEY,
			useFactory: (dataSource: DataSource) => {
				return new CoursesRepository(dataSource);
			},
			inject: [DataSource],
		},
		CreateCourseUseCase,
		GetExistingCourseUseCase,
		UpdateCourseUseCase,
		DeleteCourseUseCase,
	],
	exports: [COURSE_REPOSITORY_INTERFACE_KEY, GetExistingCourseUseCase, UpdateCourseUseCase, DeleteCourseUseCase],
})
export class CoursesModule {}
