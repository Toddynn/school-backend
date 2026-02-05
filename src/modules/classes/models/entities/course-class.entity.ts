import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Course } from '@/modules/courses/models/entities/course.entity';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';
import { CourseClassStatus } from '../../shared/enums/course-class-status.enum';

@Entity('classes')
export class CourseClass extends TimestampedEntity {
	@Column({ name: 'title' })
	title: string;

	@Column({ name: 'description', type: 'text' })
	description: string;

	@Column({ name: 'spots', type: 'int' })
	spots: number;

	@Column({
		name: 'status',
		type: 'enum',
		enum: CourseClassStatus,
		enumName: 'class_status_enum',
		default: CourseClassStatus.AVAILABLE,
	})
	status: CourseClassStatus;

	@Column({
		name: 'start_date',
		type: 'timestamp with time zone',
	})
	start_date: Date;

	@Column({
		name: 'end_date',
		type: 'timestamp with time zone',
	})
	end_date: Date;

	@Column({ name: 'course_id', type: 'uuid' })
	course_id: string;

	@ManyToOne(
		() => Course,
		(course) => course.classes,
	)
	@JoinColumn({ name: 'course_id' })
	course: Course;

	// @OneToMany(
	//  	() => ClassEnrollment,
	//  	(classEnrollment) => classEnrollment.class,
	//  	{ onDelete: 'CASCADE' },
	//  )
	//  class_enrollments: ClassEnrollment[];
}
