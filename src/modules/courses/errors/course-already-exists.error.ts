import { BadRequestException } from '@nestjs/common';

export class CourseAlreadyExistsException extends BadRequestException {
	constructor(fields: string) {
		super(`Curso já existe com os critérios: ${fields}`);
		this.name = 'CourseAlreadyExistsException';
	}
}
