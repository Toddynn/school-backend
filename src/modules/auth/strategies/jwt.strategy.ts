import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '@/shared/constants/env-variables';
import type { Role } from '@/shared/constants/roles';

export interface JwtPayload {
	sub: string;
	email: string;
	roles: Role[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: env.JWT_SECRET,
		});
	}

	validate(payload: JwtPayload): JwtPayload {
		return payload;
	}
}
