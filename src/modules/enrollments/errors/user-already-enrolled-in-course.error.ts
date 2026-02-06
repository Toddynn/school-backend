import { ConflictException } from '@nestjs/common';

export class UserAlreadyEnrolledInCourseException extends ConflictException {
	constructor(userId: string, courseId: string) {
		super(`Usuário ${userId} já está matriculado em uma classe do curso ${courseId}`);
		this.name = 'UserAlreadyEnrolledInCourseException';
	}
}
