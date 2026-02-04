import { NotFoundException } from '@nestjs/common';

export class NotFoundUserException extends NotFoundException {
	constructor(fields: string) {
		super(`Usuário não encontrado com os critérios: ${fields}`);
		this.name = 'NotFoundUserException';
	}
}
