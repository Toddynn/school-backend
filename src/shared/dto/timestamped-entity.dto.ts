import { ApiProperty } from '@nestjs/swagger';

export class TimestampedEntityDto {
	@ApiProperty({ description: 'The UUID v7 of the entity' })
	id: string;

	@ApiProperty({ description: 'The date and time when entity was created' })
	created_at: Date;

	@ApiProperty({ description: 'The date and time when entity was updated' })
	updated_at: Date;
}
