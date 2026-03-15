import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@/shared/constants/roles';
import { TimestampedEntityDto } from '@/shared/dto/timestamped-entity.dto';

export class UserDto extends TimestampedEntityDto {
	@ApiProperty({ description: 'The name of the user' })
	name: string;

	@ApiProperty({ description: 'The email of the user' })
	email: string;

	@ApiProperty({ description: 'The roles of the user', enum: Role, isArray: true })
	roles: Role[];
}
