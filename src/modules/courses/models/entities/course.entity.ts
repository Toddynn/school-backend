import { Column, Entity, OneToMany } from 'typeorm';
import { CourseClass } from '@/modules/classes/models/entities/course-class.entity';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';
import { CourseTheme } from '../../shared/enums/course-theme.enum';

@Entity('courses')
export class Course extends TimestampedEntity {
	@Column({ name: 'title' })
	title: string;

	@Column({ name: 'description', type: 'text' })
	description: string;

	@Column({ name: 'image_url' })
	image_url: string;

	@Column({
		name: 'themes',
		type: 'enum',
		enum: CourseTheme,
		enumName: 'course_theme_enum',
		array: true,
		default: [],
	})
	themes: CourseTheme[];

	@OneToMany(
		() => CourseClass,
		(classEntity) => classEntity.course,
	)
	classes: CourseClass[];
}
