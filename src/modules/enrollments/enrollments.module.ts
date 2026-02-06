import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CourseClassesModule } from '../classes/course-classes.module';
import { Enrollment } from './models/entities/enrollment.entity';
import { EnrollmentsRepository } from './repository/enrollments.repository';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from './shared/constants/repository-interface-key';
import { CreateEnrollmentController } from './use-cases/create-enrollment/create-enrollment.controller';
import { CreateEnrollmentUseCase } from './use-cases/create-enrollment/create-enrollment.use-case';
import { DeleteEnrollmentController } from './use-cases/delete-enrollment/delete-enrollment.controller';
import { DeleteEnrollmentUseCase } from './use-cases/delete-enrollment/delete-enrollment.use-case';
import { GetExistingEnrollmentUseCase } from './use-cases/get-existing-enrollment/get-existing-enrollment.use-case';
import { ListAllEnrollmentsController } from './use-cases/list-all-enrollments/list-all-enrollments.controller';
import { ListAllEnrollmentsUseCase } from './use-cases/list-all-enrollments/list-all-enrollments.use-case';

@Module({
	imports: [TypeOrmModule.forFeature([Enrollment]), CourseClassesModule],
	controllers: [CreateEnrollmentController, DeleteEnrollmentController, ListAllEnrollmentsController],
	providers: [
		{
			provide: ENROLLMENT_REPOSITORY_INTERFACE_KEY,
			useFactory: (dataSource: DataSource) => {
				return new EnrollmentsRepository(dataSource);
			},
			inject: [DataSource],
		},
		CreateEnrollmentUseCase,
		GetExistingEnrollmentUseCase,
		DeleteEnrollmentUseCase,
		ListAllEnrollmentsUseCase,
	],
	exports: [ENROLLMENT_REPOSITORY_INTERFACE_KEY, GetExistingEnrollmentUseCase],
})
export class EnrollmentsModule {}
