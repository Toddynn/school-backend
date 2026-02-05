import { ApiProperty } from '@nestjs/swagger';
import { TimestampedEntityDto } from '@/shared/dto/timestamped-entity.dto';
import { ThemeDto } from '@/modules/themes/models/dto/output/theme.dto';

export class CourseDto extends TimestampedEntityDto {
	@ApiProperty({ description: 'The title of the course' })
	title: string;

	@ApiProperty({ description: 'The description of the course' })
	description: string;

	@ApiProperty({ description: 'The image URL of the course' })
	image_url: string;

	@ApiProperty({ description: 'The themes of the course', type: [ThemeDto] })
	themes: ThemeDto[];
}
