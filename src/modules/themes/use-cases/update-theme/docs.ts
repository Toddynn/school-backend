import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateThemeDto } from '../../models/dto/input/update-theme.dto';
import { ThemeDto } from '../../models/dto/output/theme.dto';

export function UpdateThemeDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Update theme data',
			description: 'Updates theme data by id.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the theme to be updated',
			type: String,
		}),
		ApiBody({
			type: UpdateThemeDto,
			description: 'Data for theme update',
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Theme updated successfully.',
			type: ThemeDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: 'Invalid data for theme update.',
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'Theme not found.',
			schema: {
				example: {
					message: 'Tema não encontrado com os critérios: {"id":"..."}',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while updating theme.',
		}),
	);
}
