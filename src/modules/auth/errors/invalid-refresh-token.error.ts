import { UnauthorizedException } from '@nestjs/common';

export class InvalidRefreshTokenException extends UnauthorizedException {
	constructor() {
		super('Refresh token inválido ou expirado');
		this.name = 'InvalidRefreshTokenException';
	}
}
