import { BadRequestException } from '@nestjs/common';

export class UserAlreadyExistsException extends BadRequestException {
	constructor(fields: string) {
		super(`Usuário já existe com os critérios: ${fields}`);
		this.name = 'UserAlreadyExistsException';
	}
}
