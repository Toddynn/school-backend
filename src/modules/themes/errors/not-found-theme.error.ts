import { NotFoundException } from '@nestjs/common';

export class NotFoundThemeException extends NotFoundException {
	constructor(fields: string) {
		super(`Tema não encontrado com os critérios: ${fields}`);
		this.name = 'NotFoundThemeException';
	}
}
