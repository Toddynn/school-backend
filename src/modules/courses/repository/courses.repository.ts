import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import { Course } from '../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../models/interfaces/courses-repository.interface';

@Injectable()
export class CoursesRepository extends Repository<Course> implements CoursesRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Course, dataSource.createEntityManager());
	}
}
