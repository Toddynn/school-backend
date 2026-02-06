import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import { Enrollment } from '../models/entities/enrollment.entity';
import type { EnrollmentsRepositoryInterface } from '../models/interfaces/enrollments-repository.interface';

@Injectable()
export class EnrollmentsRepository extends Repository<Enrollment> implements EnrollmentsRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Enrollment, dataSource.createEntityManager());
	}
}
