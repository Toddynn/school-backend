import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import type { PaginatedResponseDto, PaginationDto } from '@/shared/dto/pagination.dto';
import { User } from '../models/entities/user.entity';
import type { UsersRepositoryInterface } from '../models/interfaces/users-repository.interface';

@Injectable()
export class UsersRepository extends Repository<User> implements UsersRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(User, dataSource.createEntityManager());
	}

	async listAllUsersPaginated({ page = 1, limit = 10, search }: PaginationDto): Promise<PaginatedResponseDto<User>> {
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder('user');

		if (search) {
			queryBuilder.where('(user.name ILIKE :search OR user.email ILIKE :search)', {
				search: `%${search}%`,
			});
		}

		queryBuilder.skip(skip);
		queryBuilder.take(limit);
		queryBuilder.orderBy('user.created_at', 'DESC');

		const [data, total] = await queryBuilder.getManyAndCount();

		const total_pages = Math.ceil(total / limit);

		return {
			data,
			page,
			limit,
			total,
			total_pages,
		};
	}
}
