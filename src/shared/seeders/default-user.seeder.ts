import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import type { UsersRepositoryInterface } from '@/modules/users/models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '@/modules/users/shared/constants/repository-interface-key';
import { Role } from '@/shared/constants/roles';
import { hashPassword } from '@/shared/helpers/hash-password.helper';

const DEFAULT_USER_EMAIL = 'admin@school.com';
const DEFAULT_USER_PASSWORD = 'admin123';
const DEFAULT_USER_NAME = 'Admin';

@Injectable()
export class DefaultUserSeeder implements OnApplicationBootstrap {
	private readonly logger = new Logger(DefaultUserSeeder.name);

	constructor(
		@Inject(USER_REPOSITORY_INTERFACE_KEY)
		private readonly usersRepository: UsersRepositoryInterface,
	) {}

	async onApplicationBootstrap(): Promise<void> {
		const existingUser = await this.usersRepository.findOneBy({ email: DEFAULT_USER_EMAIL });

		if (existingUser) {
			return;
		}

		const hashedPassword = await hashPassword(DEFAULT_USER_PASSWORD);
		const user = this.usersRepository.create({
			name: DEFAULT_USER_NAME,
			email: DEFAULT_USER_EMAIL,
			password: hashedPassword,
			roles: [Role.ACCESS],
		});

		await this.usersRepository.save(user);
		this.logger.log(`Default user created: ${DEFAULT_USER_EMAIL} / ${DEFAULT_USER_PASSWORD}`);
	}
}
