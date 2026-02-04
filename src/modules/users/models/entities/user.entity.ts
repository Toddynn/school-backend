import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';

@Entity('users')
export class User extends TimestampedEntity {
	@Column({ name: 'name' })
	name: string;

	@Column({ name: 'email', unique: true })
	email: string;

	// @OneToMany(
	// 	() => OrganizationMember,
	// 	(organizationMember) => organizationMember.user,
	// 	{ onDelete: 'CASCADE' },
	// )
	// organization_memberships: OrganizationMember[];
}
