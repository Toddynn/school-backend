import type { HttpException } from '@nestjs/common';
import type { ApiResponseOptions } from '@nestjs/swagger';

/**
 * Gera automaticamente o schema de resposta para uma exceção personalizada no Swagger
 * @param ExceptionClass A classe da exceção personalizada
 * @param exampleFields Campos de exemplo para gerar a mensagem de erro (usado no construtor da exceção)
 * @param description Descrição opcional para a resposta (se não fornecida, usa o nome da exceção)
 * @returns Opções do ApiResponse configuradas automaticamente
 */
export function getExceptionResponseSchema<T extends HttpException>(
	ExceptionClass: new (...args: unknown[]) => T,
	exampleFields: string = 'id=123',
	description?: string,
): ApiResponseOptions {
	// Instancia a exceção com os campos de exemplo para extrair o formato da mensagem
	const exceptionInstance = new ExceptionClass(exampleFields);
	const statusCode = exceptionInstance.getStatus();
	const message = exceptionInstance.message;

	// Extrai o nome do erro do response padrão do NestJS
	const errorResponse = exceptionInstance.getResponse();
	const errorName = typeof errorResponse === 'object' && errorResponse !== null && 'error' in errorResponse ? String(errorResponse.error) : 'Not Found';

	return {
		status: statusCode,
		description: description || exceptionInstance.constructor.name,
		schema: {
			example: {
				statusCode,
				message,
				error: errorName,
			},
		},
	};
}
