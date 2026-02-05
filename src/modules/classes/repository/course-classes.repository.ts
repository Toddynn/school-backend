import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import { CourseClass } from '../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../models/interfaces/course-classes-repository.interface';

@Injectable()
export class CourseClassesRepository extends Repository<CourseClass> implements CourseClassesRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(CourseClass, dataSource.createEntityManager());
	}
}
