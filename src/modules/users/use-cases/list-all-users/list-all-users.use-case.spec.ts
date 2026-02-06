import { Test, type TestingModule } from '@nestjs/testing';
import type { PaginatedResponseDto, PaginationDto } from '@/shared/dto/pagination.dto';
import type { User } from '../../models/entities/user.entity';
import type { UsersRepositoryInterface } from '../../models/interfaces/users-repository.interface';
import { USER_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { ListAllUsersUseCase } from './list-all-users.use-case';

describe('ListAllUsersUseCase', () => {
	let useCase: ListAllUsersUseCase;
	let mockUsersRepository: jest.Mocked<UsersRepositoryInterface>;

	const mockUser: User = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		name: 'John Doe',
		email: 'john@example.com',
		enrollments: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as User;

	const mockUsers: User[] = [
		mockUser,
		{
			id: '0194e7c5-8b7e-7000-8000-000000000002',
			name: 'Jane Doe',
			email: 'jane@example.com',
			enrollments: [],
			created_at: new Date('2024-01-02'),
			updated_at: new Date('2024-01-02'),
		} as unknown as User,
	];

	const mockPaginatedResponse: PaginatedResponseDto<User> = {
		data: mockUsers,
		page: 1,
		limit: 10,
		total: 2,
		total_pages: 1,
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

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ListAllUsersUseCase,
				{
					provide: USER_REPOSITORY_INTERFACE_KEY,
					useValue: mockUsersRepository,
				},
			],
		}).compile();

		useCase = module.get<ListAllUsersUseCase>(ListAllUsersUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful listing', () => {
			beforeEach(() => {
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(mockPaginatedResponse);
			});

			it('should return paginated users with default pagination', async () => {
				const paginationDto: PaginationDto = {};

				const result = await useCase.execute(paginationDto);

				expect(mockUsersRepository.listAllUsersPaginated).toHaveBeenCalledWith(paginationDto);
				expect(result).toEqual(mockPaginatedResponse);
			});

			it('should return paginated users with custom page and limit', async () => {
				const paginationDto: PaginationDto = { page: 2, limit: 5 };
				const customResponse: PaginatedResponseDto<User> = {
					...mockPaginatedResponse,
					page: 2,
					limit: 5,
				};
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(customResponse);

				const result = await useCase.execute(paginationDto);

				expect(mockUsersRepository.listAllUsersPaginated).toHaveBeenCalledWith(paginationDto);
				expect(result.page).toBe(2);
				expect(result.limit).toBe(5);
			});

			it('should pass search parameter to repository', async () => {
				const paginationDto: PaginationDto = { search: 'john' };

				await useCase.execute(paginationDto);

				expect(mockUsersRepository.listAllUsersPaginated).toHaveBeenCalledWith({ search: 'john' });
			});

			it('should return correct pagination metadata', async () => {
				const result = await useCase.execute({});

				expect(result).toHaveProperty('data');
				expect(result).toHaveProperty('page');
				expect(result).toHaveProperty('limit');
				expect(result).toHaveProperty('total');
				expect(result).toHaveProperty('total_pages');
			});
		});

		describe('empty results', () => {
			it('should return empty data array when no users found', async () => {
				const emptyResponse: PaginatedResponseDto<User> = {
					data: [],
					page: 1,
					limit: 10,
					total: 0,
					total_pages: 0,
				};
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({});

				expect(result.data).toEqual([]);
				expect(result.total).toBe(0);
				expect(result.total_pages).toBe(0);
			});

			it('should return empty results for non-matching search', async () => {
				const emptyResponse: PaginatedResponseDto<User> = {
					data: [],
					page: 1,
					limit: 10,
					total: 0,
					total_pages: 0,
				};
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({ search: 'nonexistent' });

				expect(result.data).toEqual([]);
			});
		});

		describe('search functionality', () => {
			it('should filter users by name through search parameter', async () => {
				const filteredResponse: PaginatedResponseDto<User> = {
					data: [mockUser],
					page: 1,
					limit: 10,
					total: 1,
					total_pages: 1,
				};
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(filteredResponse);

				const result = await useCase.execute({ search: 'John' });

				expect(mockUsersRepository.listAllUsersPaginated).toHaveBeenCalledWith({ search: 'John' });
				expect(result.data).toHaveLength(1);
				expect(result.data[0].name).toBe('John Doe');
			});

			it('should filter users by email through search parameter', async () => {
				const filteredResponse: PaginatedResponseDto<User> = {
					data: [mockUser],
					page: 1,
					limit: 10,
					total: 1,
					total_pages: 1,
				};
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(filteredResponse);

				const result = await useCase.execute({ search: 'john@example' });

				expect(result.data).toHaveLength(1);
				expect(result.data[0].email).toBe('john@example.com');
			});
		});

		describe('pagination edge cases', () => {
			it('should handle large page numbers', async () => {
				const emptyResponse: PaginatedResponseDto<User> = {
					data: [],
					page: 999,
					limit: 10,
					total: 2,
					total_pages: 1,
				};
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({ page: 999 });

				expect(mockUsersRepository.listAllUsersPaginated).toHaveBeenCalledWith({ page: 999 });
				expect(result.data).toEqual([]);
			});

			it('should handle limit of 1', async () => {
				const singleItemResponse: PaginatedResponseDto<User> = {
					data: [mockUser],
					page: 1,
					limit: 1,
					total: 2,
					total_pages: 2,
				};
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(singleItemResponse);

				const result = await useCase.execute({ limit: 1 });

				expect(result.data).toHaveLength(1);
				expect(result.total_pages).toBe(2);
			});

			it('should handle combined pagination and search parameters', async () => {
				const filteredResponse: PaginatedResponseDto<User> = {
					data: [mockUser],
					page: 1,
					limit: 5,
					total: 1,
					total_pages: 1,
				};
				mockUsersRepository.listAllUsersPaginated.mockResolvedValue(filteredResponse);

				const paginationDto: PaginationDto = { page: 1, limit: 5, search: 'john' };
				const result = await useCase.execute(paginationDto);

				expect(mockUsersRepository.listAllUsersPaginated).toHaveBeenCalledWith(paginationDto);
				expect(result).toEqual(filteredResponse);
			});
		});
	});
});
