import { BadRequestException } from '@nestjs/common';

export class UserAlreadyEnrolledInCourseException extends BadRequestException {
	constructor(userId: string, courseId: string) {
		super(`Usuário ${userId} já está matriculado em uma classe do curso ${courseId}`);
		this.name = 'UserAlreadyEnrolledInCourseException';
	}
}
