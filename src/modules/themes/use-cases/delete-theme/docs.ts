import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteThemeDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Delete theme',
			description: 'Deletes a theme by id.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the theme to be deleted',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Theme deleted successfully.',
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
			description: 'Unexpected error while deleting theme.',
		}),
	);
}
