import { Test, type TestingModule } from '@nestjs/testing';
import type { DeleteResult } from 'typeorm';
import { NotFoundUserException } from '../../errors/not-found-user.error';
import type { User } from '../../models/entities/user.entity';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingUserUseCase } from '../get-existing-user/get-existing-user.use-case';
import { DeleteUserUseCase } from './delete-user.use-case';

describe('DeleteUserUseCase', () => {
	let useCase: DeleteUserUseCase;
	let mockUsersRepository: jest.Mocked<UsersRepositoryInterface>;
	let mockGetExistingUserUseCase: jest.Mocked<GetExistingUserUseCase>;

	const mockUser: User = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		name: 'John Doe',
		email: 'john@example.com',
		enrollments: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as User;

	const mockDeleteResult: DeleteResult = {
		raw: [],
		affected: 1,
	};

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

		mockGetExistingUserUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetExistingUserUseCase>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DeleteUserUseCase,
				{
					provide: USER_REPOSITORY_INTERFACE_KEY,
					useValue: mockUsersRepository,
				},
				{
					provide: GetExistingUserUseCase,
					useValue: mockGetExistingUserUseCase,
				},
			],
		}).compile();

		useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful deletion', () => {
			beforeEach(() => {
				mockGetExistingUserUseCase.execute.mockResolvedValue(mockUser);
				mockUsersRepository.delete.mockResolvedValue(mockDeleteResult);
			});

			it('should delete an existing user successfully', async () => {
				const result = await useCase.execute(mockUser.id);

				expect(mockGetExistingUserUseCase.execute).toHaveBeenCalledWith({ where: { id: mockUser.id } }, { throwIfNotFound: true });
				expect(mockUsersRepository.delete).toHaveBeenCalledWith(mockUser.id);
				expect(result).toEqual(mockDeleteResult);
			});

			it('should return DeleteResult with affected count of 1', async () => {
				const result = await useCase.execute(mockUser.id);

				expect(result.affected).toBe(1);
			});

			it('should verify user existence before deletion', async () => {
				await useCase.execute(mockUser.id);

				const getExistingCallOrder = mockGetExistingUserUseCase.execute.mock.invocationCallOrder[0];
				const deleteCallOrder = mockUsersRepository.delete.mock.invocationCallOrder[0];

				expect(getExistingCallOrder).toBeLessThan(deleteCallOrder);
			});
		});

		describe('user not found', () => {
			it('should throw NotFoundUserException when user does not exist', async () => {
				const nonExistentId = 'non-existent-id';
				mockGetExistingUserUseCase.execute.mockRejectedValue(new NotFoundUserException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId)).rejects.toThrow(NotFoundUserException);
			});

			it('should not call delete when user is not found', async () => {
				mockGetExistingUserUseCase.execute.mockRejectedValue(new NotFoundUserException('id: non-existent-id'));

				await expect(useCase.execute('non-existent-id')).rejects.toThrow();

				expect(mockUsersRepository.delete).not.toHaveBeenCalled();
			});

			it('should include user id in error message', async () => {
				const nonExistentId = '0194e7c5-8b7e-7000-8000-999999999999';
				mockGetExistingUserUseCase.execute.mockRejectedValue(new NotFoundUserException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId)).rejects.toThrow(`Usuário não encontrado com os critérios: id: ${nonExistentId}`);
			});
		});

		describe('edge cases', () => {
			it('should handle deletion with zero affected rows', async () => {
				const zeroAffectedResult: DeleteResult = {
					raw: [],
					affected: 0,
				};

				mockGetExistingUserUseCase.execute.mockResolvedValue(mockUser);
				mockUsersRepository.delete.mockResolvedValue(zeroAffectedResult);

				const result = await useCase.execute(mockUser.id);

				expect(result.affected).toBe(0);
			});

			it('should pass the exact userId to repository delete method', async () => {
				const specificId = '0194e7c5-8b7e-7000-8000-123456789abc';
				mockGetExistingUserUseCase.execute.mockResolvedValue({ ...mockUser, id: specificId } as unknown as User);
				mockUsersRepository.delete.mockResolvedValue(mockDeleteResult);

				await useCase.execute(specificId);

				expect(mockUsersRepository.delete).toHaveBeenCalledWith(specificId);
			});
		});
	});
});
