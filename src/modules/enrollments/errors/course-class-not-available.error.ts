import { ConflictException } from '@nestjs/common';

export class CourseClassNotAvailableException extends ConflictException {
	constructor() {
		super(`A turma não está disponível para matrícula`);
		this.name = 'CourseClassNotAvailableException';
	}
}
