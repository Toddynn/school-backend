import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { CourseClassStatus } from '@/modules/classes/shared/enums/course-class-status.enum';
import { CourseTheme } from '@/modules/courses/shared/enums/course-theme.enum';
import { PaginationDto } from '@/shared/dto/pagination.dto';

export class ListAllCoursesPaginationDto extends PaginationDto {
	@ApiPropertyOptional({
		description: 'Themes of the course',
		enum: CourseTheme,
		isArray: true,
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (Array.isArray(value)) return value;
		if (typeof value === 'string') return value.split(',').map((v) => v.trim());
		return [value].filter(Boolean);
	})
	@IsArray()
	@IsEnum(CourseTheme, { each: true, message: 'Cada tema deve ser um tema válido' })
	themes?: CourseTheme[];

	@ApiPropertyOptional({
		description: 'Filter by course class status',
		enum: CourseClassStatus,
		isArray: true,
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (Array.isArray(value)) return value;
		if (typeof value === 'string') return value.split(',').map((v) => v.trim());
		return [value].filter(Boolean);
	})
	@IsArray()
	@IsEnum(CourseClassStatus, { each: true, message: 'Cada status deve ser um status válido' })
	courseClassStatus?: CourseClassStatus[];
}
