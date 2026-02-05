import { BadRequestException } from '@nestjs/common';

export class ClassAlreadyExistsException extends BadRequestException {
	constructor(fields: string) {
		super(`Turma já existe com os critérios: ${fields}`);
		this.name = 'ClassAlreadyExistsException';
	}
}
