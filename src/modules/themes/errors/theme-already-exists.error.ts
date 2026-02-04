import { BadRequestException } from '@nestjs/common';

export class ThemeAlreadyExistsException extends BadRequestException {
	constructor(fields: string) {
		super(`Tema já existe com os critérios: ${fields}`);
		this.name = 'ThemeAlreadyExistsException';
	}
}
