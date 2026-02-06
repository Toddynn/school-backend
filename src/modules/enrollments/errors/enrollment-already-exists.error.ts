import { BadRequestException } from '@nestjs/common';

export class EnrollmentAlreadyExistsException extends BadRequestException {
	constructor(fields: string) {
		super(`Matrícula já existe com os critérios: ${fields}`);
		this.name = 'EnrollmentAlreadyExistsException';
	}
}
