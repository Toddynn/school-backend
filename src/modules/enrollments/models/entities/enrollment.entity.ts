import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CourseClass } from '@/modules/classes/models/entities/course-class.entity';
import { User } from '@/modules/users/models/entities/user.entity';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';

@Entity('enrollments')
export class Enrollment extends TimestampedEntity {
	@Column({ name: 'user_id', type: 'uuid' })
	user_id: string;

	@Column({ name: 'class_id', type: 'uuid' })
	class_id: string;

	@CreateDateColumn({
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
		name: 'enrolled_at',
	})
	enrolled_at: Date;

	@ManyToOne(
		() => User,
		(user) => user.enrollments,
		{
			onDelete: 'CASCADE',
		},
	)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(
		() => CourseClass,
		(courseClass) => courseClass.enrollments,
		{
			onDelete: 'CASCADE',
		},
	)
	@JoinColumn({ name: 'class_id' })
	course_class: CourseClass;
}
