import { ApiProperty } from '@nestjs/swagger';
import { TimestampedEntityDto } from '@/shared/dto/timestamped-entity.dto';
import { CourseClassStatus } from '../../../shared/enums/course-class-status.enum';

export class CourseClassDto extends TimestampedEntityDto {
	@ApiProperty({ description: 'The ID of the course this class belongs to' })
	course_id: string;

	@ApiProperty({ description: 'The title of the class' })
	title: string;

	@ApiProperty({ description: 'The description of the class' })
	description: string;

	@ApiProperty({ description: 'The number of available spots' })
	spots: number;

	@ApiProperty({ description: 'The status of the class', enum: CourseClassStatus })
	status: CourseClassStatus;

	@ApiProperty({ description: 'The start date of the class' })
	start_date: Date;

	@ApiProperty({ description: 'The end date of the class' })
	end_date: Date;
}
