export function formatWhereClause(where: Record<string, any>): string {
	const fields = Object.keys(where)
		.map((key) => `${key}: ${where[key]}`)
		.join(', ');

	return fields || 'criteria';
}
