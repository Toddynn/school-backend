import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CoursesModule } from '../courses/courses.module';
import { CourseClass } from './models/entities/course-class.entity';
import { CourseClassesRepository } from './repository/course-classes.repository';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from './shared/constants/repository-interface-key';
import { CreateCourseClassController } from './use-cases/create-course-class/create-course-class.controller';
import { CreateCourseClassUseCase } from './use-cases/create-course-class/create-course-class.use-case';
import { DeleteCourseClassController } from './use-cases/delete-course-class/delete-course-class.controller';
import { DeleteCourseClassUseCase } from './use-cases/delete-course-class/delete-course-class.use-case';
import { GetExistingCourseClassUseCase } from './use-cases/get-existing-course-class/get-existing-class.use-case';
import { UpdateCourseClassController } from './use-cases/update-course-class/update-course-class.controller';
import { UpdateCourseClassUseCase } from './use-cases/update-course-class/update-course-class.use-case';

@Module({
	imports: [TypeOrmModule.forFeature([CourseClass]), CoursesModule],
	controllers: [CreateCourseClassController, UpdateCourseClassController, DeleteCourseClassController],
	providers: [
		{
			provide: COURSE_CLASSES_REPOSITORY_INTERFACE_KEY,
			useFactory: (dataSource: DataSource) => {
				return new CourseClassesRepository(dataSource);
			},
			inject: [DataSource],
		},
		CreateCourseClassUseCase,
		GetExistingCourseClassUseCase,
		UpdateCourseClassUseCase,
		DeleteCourseClassUseCase,
	],
	exports: [COURSE_CLASSES_REPOSITORY_INTERFACE_KEY, GetExistingCourseClassUseCase, UpdateCourseClassUseCase, DeleteCourseClassUseCase],
})
export class CourseClassesModule {}
