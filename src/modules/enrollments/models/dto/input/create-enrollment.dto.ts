import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
	@IsUUID()
	@IsNotEmpty()
	@ApiProperty({ description: 'The ID of the user to enroll' })
	user_id: string;

	@IsUUID()
	@IsNotEmpty()
	@ApiProperty({ description: 'The ID of the class to enroll in' })
	class_id: string;
}
