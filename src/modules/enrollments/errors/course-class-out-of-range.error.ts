import { ConflictException } from '@nestjs/common';

export class CourseClassOutOfRangeException extends ConflictException {
	constructor() {
		super(`A turma está fora do prazo de matrícula`);
		this.name = 'CourseClassOutOfRangeException';
	}
}
