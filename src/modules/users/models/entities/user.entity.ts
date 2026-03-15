import { Column, Entity, OneToMany } from 'typeorm';
import { Enrollment } from '@/modules/enrollments/models/entities/enrollment.entity';
import { Role } from '@/shared/constants/roles';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';

@Entity('users')
export class User extends TimestampedEntity {
	@Column({ name: 'name' })
	name: string;

	@Column({ name: 'email', unique: true })
	email: string;

	@Column({ name: 'password', select: false })
	password: string;

	@Column({
		name: 'roles',
		type: 'enum',
		enum: Role,
		enumName: 'user_role_enum',
		array: true,
		default: [],
	})
	roles: Role[];

	@Column({ name: 'refresh_token_hash', type: 'varchar', nullable: true, select: false })
	refresh_token_hash: string | null;

	@OneToMany(
		() => Enrollment,
		(enrollment) => enrollment.user,
	)
	enrollments: Enrollment[];
}
