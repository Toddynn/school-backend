import type { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import type { User } from '../models/entities/user.entity';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
	let repository: UsersRepository;
	let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<User>>;
	let mockDataSource: jest.Mocked<DataSource>;
	let mockEntityManager: jest.Mocked<EntityManager>;

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

	beforeEach(() => {
		mockQueryBuilder = {
			where: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			take: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([mockUsers, mockUsers.length]),
		} as unknown as jest.Mocked<SelectQueryBuilder<User>>;

		mockEntityManager = {} as jest.Mocked<EntityManager>;

		mockDataSource = {
			createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
		} as unknown as jest.Mocked<DataSource>;

		repository = new UsersRepository(mockDataSource);

		jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('listAllUsersPaginated', () => {
		it('should return paginated users with default pagination values', async () => {
			const result = await repository.listAllUsersPaginated({});

			expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
			expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.created_at', 'DESC');
			expect(result).toEqual({
				data: mockUsers,
				page: 1,
				limit: 10,
				total: 2,
				total_pages: 1,
			});
		});

		it('should return paginated users with custom pagination values', async () => {
			const result = await repository.listAllUsersPaginated({ page: 2, limit: 5 });

			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
			expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
			expect(result.page).toBe(2);
			expect(result.limit).toBe(5);
		});

		it('should apply search filter when search term is provided', async () => {
			await repository.listAllUsersPaginated({ search: 'john' });

			expect(mockQueryBuilder.where).toHaveBeenCalledWith('(user.name ILIKE :search OR user.email ILIKE :search)', { search: '%john%' });
		});

		it('should not apply search filter when search term is not provided', async () => {
			await repository.listAllUsersPaginated({});

			expect(mockQueryBuilder.where).not.toHaveBeenCalled();
		});

		it('should calculate total pages correctly', async () => {
			mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockUsers, 25]);

			const result = await repository.listAllUsersPaginated({ page: 1, limit: 10 });

			expect(result.total_pages).toBe(3);
			expect(result.total).toBe(25);
		});

		it('should return empty data array when no users found', async () => {
			mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

			const result = await repository.listAllUsersPaginated({});

			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
			expect(result.total_pages).toBe(0);
		});

		it('should handle pagination edge case with single item per page', async () => {
			mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[mockUser], 5]);

			const result = await repository.listAllUsersPaginated({ page: 3, limit: 1 });

			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(2);
			expect(mockQueryBuilder.take).toHaveBeenCalledWith(1);
			expect(result.total_pages).toBe(5);
		});

		it('should calculate correct skip value for first page', async () => {
			await repository.listAllUsersPaginated({ page: 1, limit: 10 });

			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
		});

		it('should calculate correct skip value for subsequent pages', async () => {
			await repository.listAllUsersPaginated({ page: 5, limit: 20 });

			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(80);
		});

		it('should handle search with special characters', async () => {
			await repository.listAllUsersPaginated({ search: 'john@test' });

			expect(mockQueryBuilder.where).toHaveBeenCalledWith('(user.name ILIKE :search OR user.email ILIKE :search)', { search: '%john@test%' });
		});

		it('should order results by created_at in descending order', async () => {
			await repository.listAllUsersPaginated({});

			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.created_at', 'DESC');
		});
	});
});
