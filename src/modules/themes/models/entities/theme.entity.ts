import { Column, Entity, ManyToMany } from 'typeorm';
import { Course } from '@/modules/courses/models/entities/course.entity';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';

@Entity('themes')
export class Theme extends TimestampedEntity {
	@Column({ name: 'name', unique: true })
	name: string;

	@ManyToMany(
		() => Course,
		(course) => course.themes,
	)
	courses: Course[];
}
