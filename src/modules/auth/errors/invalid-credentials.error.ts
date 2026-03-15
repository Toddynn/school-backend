import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
	constructor() {
		super('Credenciais inválidas');
		this.name = 'InvalidCredentialsException';
	}
}
