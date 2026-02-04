import { type ArgumentMetadata, BadRequestException, Inject, Injectable, Logger, type LoggerService, ValidationPipe } from '@nestjs/common';

@Injectable()
export class ReflectionGuardValidationPipe extends ValidationPipe {
	constructor(
		@Inject(Logger)
		private readonly logger: LoggerService,
	) {
		super({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		});
	}

	async transform(value: any, metadata: ArgumentMetadata) {
		if (this.shouldInspectMetadata(metadata, value)) {
			this.handleMissingReflection(metadata, value);
		}
		return super.transform(value, metadata);
	}

	private shouldInspectMetadata(metadata: ArgumentMetadata, value: any): boolean {
		if (metadata.type !== 'body' && metadata.type !== 'query') return false;
		if (!value || typeof value !== 'object' || Object.keys(value).length === 0) return false;
		return !metadata.metatype || metadata.metatype.name === 'Object' || metadata.metatype.name === 'Function';
	}

	private handleMissingReflection(metadata: ArgumentMetadata, value: any): never {
		const metatypeName = metadata.metatype?.name ?? 'Undefined';
		const payloadKeys = value && typeof value === 'object' ? Object.keys(value) : [];

		this.logger.error('REFLECTION_ERROR: DTO metadata missing', {
			context: 'ReflectionGuardValidationPipe',
			paramType: metadata.type,
			paramName: metadata.data ?? null,
			metatypeName,
			payloadKeys,
			payload: value,
			hints: [
				'Missing reflect-metadata import at bootstrap',
				'tsconfig missing emitDecoratorMetadata/experimentalDecorators',
				'Using TS-only types in @Body() (Pick/Omit/Partial/Required)',
				'Using import type for DTO used at runtime',
			],
		});

		const lines = [
			'🛑 [REFLECTION ERROR] DTO Metadata Lost 🛑',
			'---------------------------------------------------',
			`• Parameter Type   : ${metadata.type}`,
			`• Parameter Name   : ${metadata.data ?? '(unknown)'}`,
			`• Detected Metatype: ${metatypeName}`,
			`• Payload Keys     : ${payloadKeys.length ? payloadKeys.join(', ') : 'N/A'}`,
			`• Raw Payload      : ${String(value)}`,
			'---------------------------------------------------',
		];
		for (const line of lines) process.stderr.write(`${line}\n`);

		throw new BadRequestException('Backend Configuration Error: DTO metadata missing for request validation.');
	}
}
