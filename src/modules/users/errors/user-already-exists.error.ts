import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
	constructor(fields: string) {
		super(`Usuário já existe com os critérios: ${fields}`);
		this.name = 'UserAlreadyExistsException';
	}
}
