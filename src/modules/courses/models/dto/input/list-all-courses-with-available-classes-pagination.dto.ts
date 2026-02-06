import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { CourseTheme } from '@/modules/courses/shared/enums/course-theme.enum';
import { PaginationDto } from '@/shared/dto/pagination.dto';

export class ListAllCoursesWithAvailableClassesPaginationDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'Themes of the course', enum: CourseTheme, default: [] })
	@IsArray()
	@IsEnum(CourseTheme, { each: true, message: 'Cada tema deve ser um tema válido' })
	@ApiProperty({
		description: 'Themes of the course',
		enum: CourseTheme,
		default: [],
	})
	themes?: CourseTheme[];
}
