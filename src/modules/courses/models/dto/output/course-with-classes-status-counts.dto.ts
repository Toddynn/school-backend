import { ApiProperty } from '@nestjs/swagger';
import type { CourseTheme } from '@/modules/courses/shared/enums/course-theme.enum';
import { CourseDto } from './course.dto';

export interface ClassesStatusCounts {
	available_classes_count: number;
	closed_classes_count: number;
}

export interface CourseWithClassesStatusCounts {
	id: string;
	title: string;
	description: string;
	image_url: string;
	themes: CourseTheme[];
	created_at: Date;
	updated_at: Date;
	classes_count: ClassesStatusCounts;
}

class ClassesStatusCountsDto {
	@ApiProperty({ description: 'Count of available classes' })
	available_classes_count: number;

	@ApiProperty({ description: 'Count of closed classes' })
	closed_classes_count: number;
}

export class CourseWithClassesStatusCountsDto extends CourseDto {
	@ApiProperty({ description: 'Count of classes grouped by status', type: ClassesStatusCountsDto })
	classes_count: ClassesStatusCountsDto;
}
