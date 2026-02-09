import { ConflictException } from '@nestjs/common';

export class EnrollmentAlreadyExistsException extends ConflictException {
	constructor() {
		super(`Este usuário já está matriculado neste curso`);
		this.name = 'EnrollmentAlreadyExistsException';
	}
}
