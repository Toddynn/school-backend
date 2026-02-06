import { ApiProperty } from '@nestjs/swagger';
import { TimestampedEntityDto } from '@/shared/dto/timestamped-entity.dto';

export class EnrollmentDto extends TimestampedEntityDto {
	@ApiProperty({ description: 'The ID of the enrolled user' })
	user_id: string;

	@ApiProperty({ description: 'The ID of the class' })
	class_id: string;

	@ApiProperty({ description: 'The date and time when the enrollment was made' })
	enrolled_at: Date;
}
