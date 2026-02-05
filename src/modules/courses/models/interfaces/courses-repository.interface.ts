import type { Repository } from 'typeorm';
import type { Course } from '../entities/course.entity';

export interface CoursesRepositoryInterface extends Repository<Course> {}
