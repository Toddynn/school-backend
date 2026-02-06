import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function DeleteEnrollmentDocs() {
	return applyDecorators(
		ApiOperation({
			summary: 'Delete enrollment',
			description: 'Deletes an enrollment by id.',
		}),
		ApiParam({
			name: 'id',
			description: 'ID of the enrollment to be deleted',
			type: String,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: 'Enrollment deleted successfully.',
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: 'Enrollment not found.',
			schema: {
				example: {
					message: 'Matrícula não encontrada com os critérios: {"id":"..."}',
				},
			},
		}),
		ApiResponse({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			description: 'Unexpected error while deleting enrollment.',
		}),
	);
}
