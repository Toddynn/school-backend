import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from '@/shared/entities/timestamped.entity';

@Entity('themes')
export class Theme extends TimestampedEntity {
	@Column({ name: 'name', unique: true })
	name: string;
}
