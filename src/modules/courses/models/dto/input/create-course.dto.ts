import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { CourseTheme } from '@/modules/courses/shared/enums/course-theme.enum';

export class CreateCourseDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The title of the course' })
	title: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The description of the course' })
	description: string;

	@IsUrl({ protocols: ['https'], require_protocol: true }, { message: 'A URL da imagem deve ser uma URL HTTPS válida' })
	@IsNotEmpty({ message: 'A URL da imagem é obrigatória' })
	@ApiProperty({ description: 'The image URL of the course (HTTPS only)', example: 'https://example.com/image.png' })
	image_url: string;

	@IsArray()
	@IsEnum(CourseTheme, { each: true, message: 'Cada tema deve ser um tema válido' })
	@ApiProperty({
		description: 'Themes of the course',
		enum: CourseTheme,
		isArray: true,
		example: [CourseTheme.TECHNOLOGY, CourseTheme.INNOVATION],
	})
	themes: CourseTheme[];
}
