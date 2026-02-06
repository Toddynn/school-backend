import { NotFoundException } from '@nestjs/common';

export class NotFoundEnrollmentException extends NotFoundException {
	constructor(fields: string) {
		super(`Matrícula não encontrada com os critérios: ${fields}`);
		this.name = 'NotFoundEnrollmentException';
	}
}
