import { ConflictException } from '@nestjs/common';

export class CourseClassFullException extends ConflictException {
	constructor() {
		super(`A turma não possui mais vagas disponíveis`);
		this.name = 'CourseClassFullException';
	}
}
