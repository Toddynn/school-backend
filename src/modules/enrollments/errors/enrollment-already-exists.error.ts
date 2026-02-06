import { ConflictException } from '@nestjs/common';

export class EnrollmentAlreadyExistsException extends ConflictException {
	constructor(fields: string) {
		super(`Matrícula já existe com os critérios: ${fields}`);
		this.name = 'EnrollmentAlreadyExistsException';
	}
}
