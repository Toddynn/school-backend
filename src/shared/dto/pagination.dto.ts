import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationDto {
	@ApiPropertyOptional({ description: 'Number of the page', default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ description: 'Search' })
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({ description: 'Number of items per page', default: 10, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 10;
}

export class PaginatedResponseDto<T> {
	@ApiProperty({ description: 'List of items', isArray: true })
	data: Array<T>;

	@ApiProperty({ description: 'Current page number' })
	page: number;

	@ApiProperty({ description: 'Number of items per page' })
	limit: number;

	@ApiProperty({ description: 'Total number of items' })
	total: number;

	@ApiProperty({ description: 'Total number of pages' })
	total_pages: number;
}
