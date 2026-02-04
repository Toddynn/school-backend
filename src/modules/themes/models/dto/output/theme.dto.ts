import { ApiProperty } from '@nestjs/swagger';
import { TimestampedEntityDto } from '@/shared/dto/timestamped-entity.dto';

export class ThemeDto extends TimestampedEntityDto {
	@ApiProperty({ description: 'The name of the theme' })
	name: string;
}
