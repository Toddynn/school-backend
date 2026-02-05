import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUrl, ArrayMinSize } from 'class-validator';

export class CreateCourseDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The title of the course' })
	title: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({ description: 'The description of the course' })
	description: string;

	@IsUrl({ protocols: ['https'], require_protocol: true })
	@ApiProperty({ description: 'The image URL of the course (HTTPS only)', example: 'https://example.com/image.png' })
	image_url: string;

	@IsArray()
	@ArrayMinSize(0)
	@IsString({ each: true })
	@ApiProperty({ description: 'IDs of themes included in the course', type: [String] })
	theme_ids: string[];
}
