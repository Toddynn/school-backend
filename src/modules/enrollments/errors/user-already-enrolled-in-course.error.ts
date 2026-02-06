import { ConflictException } from '@nestjs/common';

export class UserAlreadyEnrolledInCourseException extends ConflictException {
	constructor() {
		super(`Usuário já está matriculado em uma classe deste curso`);
		this.name = 'UserAlreadyEnrolledInCourseException';
	}
}
