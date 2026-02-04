import { BaseEntity, PrimaryColumn } from 'typeorm';

export abstract class UUIDV7BaseEntity extends BaseEntity {
	@PrimaryColumn({ name: 'id', type: 'uuid', default: () => 'uuidv7()' })
	id: string;
}
