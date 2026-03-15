import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';
import { RefreshTokenDto } from '../../models/dto/input/refresh-token.dto';
import type { AuthTokensDto } from '../../models/dto/output/auth-tokens.dto';
import { RefreshTokenDocs } from './docs';
import { RefreshTokenUseCase } from './refresh-token.use-case';

@ApiTags('Auth')
@Controller('auth')
export class RefreshTokenController {
	constructor(
		@Inject(RefreshTokenUseCase)
		private readonly refreshTokenUseCase: RefreshTokenUseCase,
	) {}

	@Post('refresh')
	@Public()
	@HttpCode(HttpStatus.OK)
	@RefreshTokenDocs()
	async execute(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthTokensDto> {
		return await this.refreshTokenUseCase.execute(refreshTokenDto);
	}
}
