import { ConflictException } from '@nestjs/common';

export class CourseAlreadyExistsException extends ConflictException {
	constructor(fields: string) {
		super(`Curso já existe com os critérios: ${fields}`);
		this.name = 'CourseAlreadyExistsException';
	}
}
