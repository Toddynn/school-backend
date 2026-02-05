import { NotFoundException } from '@nestjs/common';

export class NotFoundClassException extends NotFoundException {
	constructor(fields: string) {
		super(`Turma não encontrada com os critérios: ${fields}`);
		this.name = 'NotFoundClassException';
	}
}
