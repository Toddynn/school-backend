import { Column, Entity, OneToMany } from 'typeorm';
import { Enrollment } from '@/modules/enrollments/models/entities/enrollment.entity';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';

@Entity('users')
export class User extends TimestampedEntity {
	@Column({ name: 'name' })
	name: string;

	@Column({ name: 'email', unique: true })
	email: string;

	@OneToMany(
		() => Enrollment,
		(enrollment) => enrollment.user,
	)
	enrollments: Enrollment[];
}
