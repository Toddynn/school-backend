import { BadRequestException } from '@nestjs/common';

export class InvalidClassDateRangeException extends BadRequestException {
	constructor() {
		super('A data de início deve ser anterior à data de término');
		this.name = 'InvalidClassDateRangeException';
	}
}
