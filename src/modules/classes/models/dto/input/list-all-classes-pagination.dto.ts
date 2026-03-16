import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CourseClassStatus } from '../../../shared/enums/course-class-status.enum';

export class ListAllClassesPaginationDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'Filter by course ID' })
	@IsOptional()
	@IsUUID()
	course_id?: string;

	@ApiPropertyOptional({ description: 'Include enrollment status for this user ID' })
	@IsOptional()
	@IsUUID()
	current_user_id?: string;

	@ApiPropertyOptional({ description: 'Filter by class status', enum: CourseClassStatus, isArray: true })
	@IsOptional()
	@Transform(({ value }) => {
		if (Array.isArray(value)) return value;
		if (typeof value === 'string') return value.split(',').map((v) => v.trim());
		return [value].filter(Boolean);
	})
	@IsArray()
	@IsEnum(CourseClassStatus, { each: true, message: 'Cada status deve ser um status válido' })
	status?: CourseClassStatus[];

	@ApiPropertyOptional({ description: 'Filter classes starting from this date' })
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@Transform(({ value }) => (value ? new Date(value) : undefined))
	start_date?: Date;

	@ApiPropertyOptional({ description: 'Filter classes ending until this date' })
	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@Transform(({ value }) => (value ? new Date(value) : undefined))
	end_date?: Date;
}
