import type { GetExistingOptions } from '../interfaces/get-existing-options';

interface NormalizedGetExistingOptions {
	throwIfFound: boolean;
	throwIfNotFound: boolean;
}

/**
 * Normaliza as opções de GetExistingOptions aplicando lógica inteligente:
 * - Se throwIfFound é true e throwIfNotFound não foi definido, assume false
 * - Se throwIfNotFound é true e throwIfFound não foi definido, assume false
 * - Caso contrário, usa os valores padrão (throwIfFound: false, throwIfNotFound: true)
 */
export function normalizeGetExistingOptions(options: GetExistingOptions = {}): NormalizedGetExistingOptions {
	const throwIfFound = options.throwIfFound ?? false;
	const throwIfNotFound = options.throwIfNotFound ?? !throwIfFound;

	return {
		throwIfFound,
		throwIfNotFound,
	};
}
