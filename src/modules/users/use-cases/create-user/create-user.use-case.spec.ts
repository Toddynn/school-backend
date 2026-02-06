import { Test, type TestingModule } from '@nestjs/testing';
import { UserAlreadyExistsException } from '../../errors/user-already-exists.error';
import type { CreateUserDto } from '../../models/dto/input/create-user.dto';
import type { User } from '../../models/entities/user.entity';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingUserUseCase } from '../get-existing-user/get-existing-user.use-case';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
	let useCase: CreateUserUseCase;
	let mockUsersRepository: jest.Mocked<UsersRepositoryInterface>;
	let mockGetExistingUserUseCase: jest.Mocked<GetExistingUserUseCase>;

	const mockUser = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		name: 'John Doe',
		email: 'john@example.com',
		enrollments: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as User;

	const createUserDto: CreateUserDto = {
		name: 'John Doe',
		email: 'john@example.com',
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
				CreateUserUseCase,
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

		useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful creation', () => {
			beforeEach(() => {
				mockGetExistingUserUseCase.execute.mockResolvedValue(null);
				mockUsersRepository.create.mockReturnValue(mockUser);
				mockUsersRepository.save.mockResolvedValue(mockUser);
			});

			it('should create a new user successfully', async () => {
				const result = await useCase.execute(createUserDto);

				expect(mockGetExistingUserUseCase.execute).toHaveBeenCalledWith({ where: { email: createUserDto.email } }, { throwIfFound: true });
				expect(mockUsersRepository.create).toHaveBeenCalledWith(createUserDto);
				expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
				expect(result).toEqual(mockUser);
			});

			it('should return the created user with all properties', async () => {
				const result = await useCase.execute(createUserDto);

				expect(result).toHaveProperty('id');
				expect(result).toHaveProperty('name', createUserDto.name);
				expect(result).toHaveProperty('email', createUserDto.email);
				expect(result).toHaveProperty('created_at');
				expect(result).toHaveProperty('updated_at');
			});
		});

		describe('user already exists', () => {
			it('should throw UserAlreadyExistsException when email is already registered', async () => {
				mockGetExistingUserUseCase.execute.mockRejectedValue(new UserAlreadyExistsException(`email: ${createUserDto.email}`));

				await expect(useCase.execute(createUserDto)).rejects.toThrow(UserAlreadyExistsException);
			});

			it('should not call create or save when user already exists', async () => {
				mockGetExistingUserUseCase.execute.mockRejectedValue(new UserAlreadyExistsException(`email: ${createUserDto.email}`));

				await expect(useCase.execute(createUserDto)).rejects.toThrow();

				expect(mockUsersRepository.create).not.toHaveBeenCalled();
				expect(mockUsersRepository.save).not.toHaveBeenCalled();
			});

			it('should include email in error message when user already exists', async () => {
				mockGetExistingUserUseCase.execute.mockRejectedValue(new UserAlreadyExistsException(`email: ${createUserDto.email}`));

				await expect(useCase.execute(createUserDto)).rejects.toThrow(`Usuário já existe com os critérios: email: ${createUserDto.email}`);
			});
		});

		describe('edge cases', () => {
			it('should handle user creation with minimal data', async () => {
				const minimalDto: CreateUserDto = {
					name: 'A',
					email: 'a@b.co',
				};
				const minimalUser = {
					...mockUser,
					name: minimalDto.name,
					email: minimalDto.email,
				} as unknown as User;

				mockGetExistingUserUseCase.execute.mockResolvedValue(null);
				mockUsersRepository.create.mockReturnValue(minimalUser);
				mockUsersRepository.save.mockResolvedValue(minimalUser);

				const result = await useCase.execute(minimalDto);

				expect(result.name).toBe(minimalDto.name);
				expect(result.email).toBe(minimalDto.email);
			});

			it('should check for existing user before creating', async () => {
				mockGetExistingUserUseCase.execute.mockResolvedValue(null);
				mockUsersRepository.create.mockReturnValue(mockUser);
				mockUsersRepository.save.mockResolvedValue(mockUser);

				await useCase.execute(createUserDto);

				const getExistingCallOrder = mockGetExistingUserUseCase.execute.mock.invocationCallOrder[0];
				const createCallOrder = mockUsersRepository.create.mock.invocationCallOrder[0];

				expect(getExistingCallOrder).toBeLessThan(createCallOrder);
			});
		});
	});
});
