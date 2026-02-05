import { NotFoundException } from '@nestjs/common';

export class NotFoundCourseException extends NotFoundException {
	constructor(fields: string) {
		super(`Curso não encontrado com os critérios: ${fields}`);
		this.name = 'NotFoundCourseException';
	}
}
