import type { HttpException } from '@nestjs/common';
import type { ApiResponseOptions } from '@nestjs/swagger';

type AnyConstructorArgs = unknown[];

type ExceptionClass<T extends HttpException> = new (...args: AnyConstructorArgs) => T;

interface ExceptionResponseOptions {
	description?: string;
}

interface ExceptionConfig {
	exception: ExceptionClass<HttpException>;
	args: AnyConstructorArgs;
	summary?: string;
}

export function getExceptionResponseSchema<T extends HttpException>(
	Exception: ExceptionClass<T>,
	constructorArgs: AnyConstructorArgs,
	options?: ExceptionResponseOptions,
): ApiResponseOptions {
	const exceptionInstance = new Exception(...constructorArgs);
	const statusCode = exceptionInstance.getStatus();
	const message = exceptionInstance.message;

	const errorResponse = exceptionInstance.getResponse();
	const errorName =
		typeof errorResponse === 'object' && errorResponse !== null && 'error' in errorResponse
			? String(errorResponse.error)
			: 'Error';

	return {
		status: statusCode,
		description: options?.description ?? exceptionInstance.name,
		schema: {
			example: {
				statusCode,
				message,
				error: errorName,
			},
		},
	};
}

export function getGroupedExceptionResponseSchema(
	exceptions: ExceptionConfig[],
	options?: ExceptionResponseOptions,
): ApiResponseOptions {
	if (exceptions.length === 0) {
		throw new Error('At least one exception must be provided');
	}

	const firstInstance = new exceptions[0].exception(...exceptions[0].args);
	const statusCode = firstInstance.getStatus();

	const errorResponse = firstInstance.getResponse();
	const errorName =
		typeof errorResponse === 'object' && errorResponse !== null && 'error' in errorResponse
			? String(errorResponse.error)
			: 'Error';

	const examples: Record<string, { summary: string; value: { statusCode: number; message: string; error: string } }> =
		{};

	for (const config of exceptions) {
		const instance = new config.exception(...config.args);
		const key = instance.name.replace(/Exception$/, '').replace(/([A-Z])/g, '_$1').toLowerCase().slice(1);

		examples[key] = {
			summary: config.summary ?? instance.name,
			value: {
				statusCode: instance.getStatus(),
				message: instance.message,
				error: errorName,
			},
		};
	}

	return {
		status: statusCode,
		description: options?.description ?? errorName,
		schema: {
			examples,
		},
	};
}
