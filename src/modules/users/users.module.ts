import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from './models/entities/user.entity';
import { UsersRepository } from './repository/users.repository';
import { USER_REPOSITORY_INTERFACE_KEY } from './shared/constants/repository-interface-key';
import { CreateUserController } from './use-cases/create-user/create-user.controller';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { GetExistingUserUseCase } from './use-cases/get-existing-user/get-existing-user.use-case';
import { UpdateUserController } from './use-cases/update-user/update-user.controller';
import { UpdateUserUseCase } from './use-cases/update-user/update-user.use-case';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [CreateUserController, UpdateUserController],
	providers: [
		{
			provide: USER_REPOSITORY_INTERFACE_KEY,
			useFactory: (dataSource: DataSource) => {
				return new UsersRepository(dataSource);
			},
			inject: [DataSource],
		},
		CreateUserUseCase,
		GetExistingUserUseCase,
		UpdateUserUseCase,
	],
	exports: [USER_REPOSITORY_INTERFACE_KEY, GetExistingUserUseCase, UpdateUserUseCase],
})
export class UsersModule {}
