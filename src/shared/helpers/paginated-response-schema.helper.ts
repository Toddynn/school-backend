import type { Type } from '@nestjs/common';
import { getSchemaPath } from '@nestjs/swagger';

export function getPaginatedResponseSchema<T>(itemClass: Type<T>) {
	return {
		type: 'object',
		properties: {
			data: {
				type: 'array',
				items: { $ref: getSchemaPath(itemClass) },
			},
			page: {
				type: 'number',
				description: 'Número da página atual',
			},
			limit: {
				type: 'number',
				description: 'Quantidade de itens por página',
			},
			total: {
				type: 'number',
				description: 'Total de itens',
			},
			total_pages: {
				type: 'number',
				description: 'Total de páginas',
			},
		},
	};
}
