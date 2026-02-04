import { Injectable } from '@nestjs/common';
import { type DataSource, Repository } from 'typeorm';
import { User } from '../models/entities/user.entity';
import type { UsersRepositoryInterface } from '../models/interfaces/users-repository.interface';

@Injectable()
export class UsersRepository extends Repository<User> implements UsersRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(User, dataSource.createEntityManager());
	}
}
