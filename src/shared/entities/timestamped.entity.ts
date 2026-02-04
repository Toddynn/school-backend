import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UUIDV7BaseEntity } from './uuid-v7-base.entity';

export abstract class TimestampedEntity extends UUIDV7BaseEntity {
	@CreateDateColumn({
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
		name: 'created_at',
	})
	created_at: Date;

	@UpdateDateColumn({
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
		onUpdate: 'CURRENT_TIMESTAMP',
		name: 'updated_at',
	})
	updated_at: Date;
}
