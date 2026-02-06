import { Test, type TestingModule } from '@nestjs/testing';
import type { UpdateResult } from 'typeorm';
import { NotFoundUserException } from '../../errors/not-found-user.error';
import type { UpdateUserDto } from '../../models/dto/input/update-user.dto';
import type { User } from '../../models/entities/user.entity';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingUserUseCase } from '../get-existing-user/get-existing-user.use-case';
import { UpdateUserUseCase } from './update-user.use-case';

describe('UpdateUserUseCase', () => {
	let useCase: UpdateUserUseCase;
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

	const mockUpdateResult: UpdateResult = {
		raw: [],
		affected: 1,
		generatedMaps: [],
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
				UpdateUserUseCase,
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

		useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful update', () => {
			beforeEach(() => {
				mockGetExistingUserUseCase.execute.mockResolvedValue(mockUser);
				mockUsersRepository.update.mockResolvedValue(mockUpdateResult);
			});

			it('should update an existing user successfully', async () => {
				const updateDto: UpdateUserDto = { name: 'Jane Doe' };

				const result = await useCase.execute(mockUser.id, updateDto);

				expect(mockGetExistingUserUseCase.execute).toHaveBeenCalledWith({ where: { id: mockUser.id } }, { throwIfNotFound: true });
				expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, updateDto);
				expect(result).toEqual(mockUpdateResult);
			});

			it('should update user name only', async () => {
				const updateDto: UpdateUserDto = { name: 'Updated Name' };

				await useCase.execute(mockUser.id, updateDto);

				expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, { name: 'Updated Name' });
			});

			it('should update user email only', async () => {
				const updateDto: UpdateUserDto = { email: 'newemail@example.com' };

				await useCase.execute(mockUser.id, updateDto);

				expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, {
					email: 'newemail@example.com',
				});
			});

			it('should update both name and email', async () => {
				const updateDto: UpdateUserDto = {
					name: 'New Name',
					email: 'newemail@example.com',
				};

				await useCase.execute(mockUser.id, updateDto);

				expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, updateDto);
			});

			it('should return UpdateResult with affected count of 1', async () => {
				const updateDto: UpdateUserDto = { name: 'Updated' };

				const result = await useCase.execute(mockUser.id, updateDto);

				expect(result.affected).toBe(1);
			});

			it('should verify user existence before update', async () => {
				const updateDto: UpdateUserDto = { name: 'Updated' };

				await useCase.execute(mockUser.id, updateDto);

				const getExistingCallOrder = mockGetExistingUserUseCase.execute.mock.invocationCallOrder[0];
				const updateCallOrder = mockUsersRepository.update.mock.invocationCallOrder[0];

				expect(getExistingCallOrder).toBeLessThan(updateCallOrder);
			});
		});

		describe('user not found', () => {
			it('should throw NotFoundUserException when user does not exist', async () => {
				const nonExistentId = 'non-existent-id';
				const updateDto: UpdateUserDto = { name: 'Updated' };

				mockGetExistingUserUseCase.execute.mockRejectedValue(new NotFoundUserException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId, updateDto)).rejects.toThrow(NotFoundUserException);
			});

			it('should not call update when user is not found', async () => {
				const updateDto: UpdateUserDto = { name: 'Updated' };
				mockGetExistingUserUseCase.execute.mockRejectedValue(new NotFoundUserException('id: non-existent-id'));

				await expect(useCase.execute('non-existent-id', updateDto)).rejects.toThrow();

				expect(mockUsersRepository.update).not.toHaveBeenCalled();
			});

			it('should include user id in error message', async () => {
				const nonExistentId = '0194e7c5-8b7e-7000-8000-999999999999';
				const updateDto: UpdateUserDto = { name: 'Updated' };

				mockGetExistingUserUseCase.execute.mockRejectedValue(new NotFoundUserException(`id: ${nonExistentId}`));

				await expect(useCase.execute(nonExistentId, updateDto)).rejects.toThrow(`Usuário não encontrado com os critérios: id: ${nonExistentId}`);
			});
		});

		describe('edge cases', () => {
			it('should handle empty update dto', async () => {
				const emptyUpdateDto: UpdateUserDto = {};

				mockGetExistingUserUseCase.execute.mockResolvedValue(mockUser);
				mockUsersRepository.update.mockResolvedValue(mockUpdateResult);

				await useCase.execute(mockUser.id, emptyUpdateDto);

				expect(mockUsersRepository.update).toHaveBeenCalledWith(mockUser.id, {});
			});

			it('should handle update with zero affected rows', async () => {
				const zeroAffectedResult: UpdateResult = {
					raw: [],
					affected: 0,
					generatedMaps: [],
				};
				const updateDto: UpdateUserDto = { name: 'Updated' };

				mockGetExistingUserUseCase.execute.mockResolvedValue(mockUser);
				mockUsersRepository.update.mockResolvedValue(zeroAffectedResult);

				const result = await useCase.execute(mockUser.id, updateDto);

				expect(result.affected).toBe(0);
			});

			it('should pass the exact userId to repository update method', async () => {
				const specificId = '0194e7c5-8b7e-7000-8000-123456789abc';
				const updateDto: UpdateUserDto = { name: 'Updated' };

				mockGetExistingUserUseCase.execute.mockResolvedValue({ ...mockUser, id: specificId } as unknown as User);
				mockUsersRepository.update.mockResolvedValue(mockUpdateResult);

				await useCase.execute(specificId, updateDto);

				expect(mockUsersRepository.update).toHaveBeenCalledWith(specificId, updateDto);
			});
		});
	});
});
