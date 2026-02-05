import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { CourseClassStatus } from '../../../shared/enums/course-class-status.enum';

export class CreateCourseClassDto {
	@IsUUID()
	@ApiProperty({ description: 'The ID of the course this class belongs to' })
	course_id: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(255, { message: 'The title must be less than 255 characters' })
	@ApiProperty({ description: 'The title of the class' })
	title: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The description of the class' })
	description: string;

	@IsInt()
	@Min(1, { message: 'The number of available spots must be greater than 0' })
	@ApiProperty({ description: 'The number of available spots' })
	spots: number;

	@IsOptional()
	@IsEnum(CourseClassStatus)
	@ApiProperty({ description: 'The status of the class', enum: CourseClassStatus, default: CourseClassStatus.AVAILABLE })
	status?: CourseClassStatus;

	@IsDate()
	@Type(() => Date)
	@ApiProperty({ description: 'The start date of the class', example: '2025-03-01T09:00:00.000Z' })
	start_date: Date;

	@IsDate()
	@Type(() => Date)
	@ApiProperty({ description: 'The end date of the class', example: '2025-06-30T18:00:00.000Z' })
	end_date: Date;
}
