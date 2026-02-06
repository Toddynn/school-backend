import 'dotenv/config';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupDocumentationConfig } from './configs/documentation/documentation.config';
import { FRONT_END_URL, env } from './shared/constants/env-variables';
import { ReflectionGuardValidationPipe } from './shared/pipes/safe-type-declaration-pipe';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.useGlobalPipes(app.get(ReflectionGuardValidationPipe));

	const corsOptions: CorsOptions = {
		origin: [FRONT_END_URL],
		credentials: true,
	};
	app.enableCors(corsOptions);

	if (process.env.NODE_ENV !== 'production') {
		setupDocumentationConfig(app);
	}

	await app.listen(env.APP_PORT ?? 3000, '0.0.0.0');
}

bootstrap().catch((error) => {
	console.error('Falha ao iniciar a aplicação:', error);
	process.exit(1);
});
