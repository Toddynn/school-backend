import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { CourseClass } from '@/modules/classes/models/entities/course-class.entity';
import { Theme } from '@/modules/themes/models/entities/theme.entity';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';

@Entity('courses')
export class Course extends TimestampedEntity {
	@Column({ name: 'title' })
	title: string;

	@Column({ name: 'description', type: 'text' })
	description: string;

	@Column({ name: 'image_url' })
	image_url: string;

	@ManyToMany(
		() => Theme,
		(theme) => theme.courses,
	)
	@JoinTable({
		name: 'course_themes',
		joinColumn: { name: 'course_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'theme_id', referencedColumnName: 'id' },
	})
	themes: Theme[];

	@OneToMany(
		() => CourseClass,
		(classEntity) => classEntity.course,
	)
	classes: CourseClass[];
}
