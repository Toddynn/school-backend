import type { Enrollment } from '@/modules/enrollments/models/entities/enrollment.entity';
import type { Role } from '@/shared/constants/roles';
import type { TimestampedEntityInterface } from '@/shared/interfaces/timestamped-entity';

export interface User extends TimestampedEntityInterface {
	name: string;
	email: string;
	password: string;
	roles: Role[];
	refresh_token_hash: string | null;
	enrollments: Enrollment[];
}
