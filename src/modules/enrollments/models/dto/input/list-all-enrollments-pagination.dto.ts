import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

export class ListAllEnrollmentsPaginationDto extends PaginationDto {
	@ApiPropertyOptional({ description: 'Filter by user ID' })
	@IsOptional()
	@IsUUID()
	user_id?: string;

	@ApiPropertyOptional({ description: 'Filter by class ID' })
	@IsOptional()
	@IsUUID()
	class_id?: string;

	@ApiPropertyOptional({ description: 'Filter by course ID' })
	@IsOptional()
	@IsUUID()
	course_id?: string;
}
