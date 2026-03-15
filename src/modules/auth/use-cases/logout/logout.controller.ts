import { Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { JwtPayload } from '../../strategies/jwt.strategy';
import { LogoutDocs } from './docs';
import { LogoutUseCase } from './logout.use-case';

@ApiTags('Auth')
@Controller('auth')
export class LogoutController {
	constructor(
		@Inject(LogoutUseCase)
		private readonly logoutUseCase: LogoutUseCase,
	) {}

	@Post('logout')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBearerAuth()
	@LogoutDocs()
	async execute(@CurrentUser() currentUser: JwtPayload): Promise<void> {
		return await this.logoutUseCase.execute(currentUser);
	}
}
