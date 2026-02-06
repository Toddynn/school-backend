import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundUserException } from '../../errors/not-found-user.error';
import { UserAlreadyExistsException } from '../../errors/user-already-exists.error';
import type { User } from '../../models/entities/user.entity';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingUserUseCase } from './get-existing-user.use-case';

describe('GetExistingUserUseCase', () => {
	let useCase: GetExistingUserUseCase;
	let mockUsersRepository: jest.Mocked<UsersRepositoryInterface>;

	const mockUser: User = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		name: 'John Doe',
		email: 'john@example.com',
		enrollments: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as User;

	beforeEach(async () => {
		mockUsersRepository = {
			findOne: jest.fn(),
			find: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			listAllUsersPaginated: jest.fn(),
		} as unknown as jest.Mocked<UsersRepositoryInterface>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetExistingUserUseCase,
				{
					provide: USER_REPOSITORY_INTERFACE_KEY,
					useValue: mockUsersRepository,
				},
			],
		}).compile();

		useCase = module.get<GetExistingUserUseCase>(GetExistingUserUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('when user exists', () => {
			beforeEach(() => {
				mockUsersRepository.findOne.mockResolvedValue(mockUser);
			});

			it('should return the user when found and no options are provided', async () => {
				const result = await useCase.execute({ where: { id: mockUser.id } });

				expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
				expect(result).toEqual(mockUser);
			});

			it('should return the user when found with throwIfNotFound: true', async () => {
				const result = await useCase.execute({ where: { id: mockUser.id } }, { throwIfNotFound: true });

				expect(result).toEqual(mockUser);
			});

			it('should throw UserAlreadyExistsException when user exists and throwIfFound is true', async () => {
				await expect(useCase.execute({ where: { email: mockUser.email } }, { throwIfFound: true })).rejects.toThrow(UserAlreadyExistsException);
			});

			it('should include field info in UserAlreadyExistsException message', async () => {
				await expect(useCase.execute({ where: { email: mockUser.email } }, { throwIfFound: true })).rejects.toThrow(
					'Usuário já existe com os critérios: email: john@example.com',
				);
			});
		});

		describe('when user does not exist', () => {
			beforeEach(() => {
				mockUsersRepository.findOne.mockResolvedValue(null);
			});

			it('should return null when user not found and throwIfNotFound is false', async () => {
				const result = await useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: false });

				expect(result).toBeNull();
			});

			it('should throw NotFoundUserException when user not found and throwIfNotFound is true', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true })).rejects.toThrow(NotFoundUserException);
			});

			it('should include field info in NotFoundUserException message', async () => {
				await expect(useCase.execute({ where: { id: 'non-existent-id' } }, { throwIfNotFound: true })).rejects.toThrow(
					'Usuário não encontrado com os critérios: id: non-existent-id',
				);
			});

			it('should return null when throwIfFound is true and user not found', async () => {
				const result = await useCase.execute({ where: { email: 'new@example.com' } }, { throwIfFound: true });

				expect(result).toBeNull();
			});
		});

		describe('option normalization behavior', () => {
			it('should default throwIfNotFound to true when no options provided', async () => {
				mockUsersRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: { id: 'non-existent-id' } })).rejects.toThrow(NotFoundUserException);
			});

			it('should set throwIfNotFound to false when throwIfFound is true', async () => {
				mockUsersRepository.findOne.mockResolvedValue(null);

				const result = await useCase.execute({ where: { email: 'test@example.com' } }, { throwIfFound: true });

				expect(result).toBeNull();
			});
		});

		describe('edge cases', () => {
			it('should handle empty where clause', async () => {
				mockUsersRepository.findOne.mockResolvedValue(null);

				await expect(useCase.execute({ where: {} }, { throwIfNotFound: true })).rejects.toThrow(
					'Usuário não encontrado com os critérios: criteria',
				);
			});

			it('should handle multiple where criteria', async () => {
				mockUsersRepository.findOne.mockResolvedValue(mockUser);

				const result = await useCase.execute({ where: { name: 'John Doe', email: 'john@example.com' } }, { throwIfNotFound: true });

				expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
					where: { name: 'John Doe', email: 'john@example.com' },
				});
				expect(result).toEqual(mockUser);
			});
		});
	});
});
