import type { Repository } from 'typeorm';
import type { CourseClass } from '../entities/course-class.entity';

export interface CourseClassesRepositoryInterface extends Repository<CourseClass> {}
