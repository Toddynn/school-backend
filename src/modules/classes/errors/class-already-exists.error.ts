import { ConflictException } from '@nestjs/common';

export class ClassAlreadyExistsException extends ConflictException {
	constructor(fields: string) {
		super(`Turma já existe com os critérios: ${fields}`);
		this.name = 'ClassAlreadyExistsException';
	}
}
