import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateThemeDto } from '../../models/dto/input/create-theme.dto';
import { ThemeDto } from '../../models/dto/output/theme.dto';

export function CreateThemeDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Create a new theme',
			description: 'Creates a new theme with name. The name is validated for uniqueness.',
		}),
		ApiBody({
			type: CreateThemeDto,
			description: 'Data for theme creation',
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: 'Theme created successfully.',
			type: ThemeDto,
		}),
		ApiResponse({
			status: HttpStatus.CONFLICT,
			description: 'Data conflict. The provided name is already in use.',
			schema: {
				examples: {
					name_duplicado: {
						summary: 'Name already registered',
						value: {
							message: 'Tema já existe com os critérios: name: ...',
						},
					},
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for theme creation.',
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while creating theme.',
		}),
	);
}
