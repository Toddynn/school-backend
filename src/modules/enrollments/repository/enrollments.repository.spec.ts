import type { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import type { Enrollment } from '../models/entities/enrollment.entity';
import { EnrollmentsRepository } from './enrollments.repository';

describe('EnrollmentsRepository', () => {
	let repository: EnrollmentsRepository;
	let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Enrollment>>;
	let mockDataSource: jest.Mocked<DataSource>;
	let mockEntityManager: jest.Mocked<EntityManager>;

	const mockEnrollment: Enrollment = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		user_id: '0194e7c5-8b7e-7000-8000-000000000002',
		class_id: '0194e7c5-8b7e-7000-8000-000000000003',
		enrolled_at: new Date('2024-01-01'),
		user: {} as never,
		course_class: {} as never,
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as Enrollment;

	const mockEnrollments: Enrollment[] = [
		mockEnrollment,
		{
			id: '0194e7c5-8b7e-7000-8000-000000000004',
			user_id: '0194e7c5-8b7e-7000-8000-000000000005',
			class_id: '0194e7c5-8b7e-7000-8000-000000000003',
			enrolled_at: new Date('2024-01-02'),
			user: {} as never,
			course_class: {} as never,
			created_at: new Date('2024-01-02'),
			updated_at: new Date('2024-01-02'),
		} as unknown as Enrollment,
	];

	beforeEach(() => {
		mockQueryBuilder = {
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			andWhere: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			take: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([mockEnrollments, mockEnrollments.length]),
		} as unknown as jest.Mocked<SelectQueryBuilder<Enrollment>>;

		mockEntityManager = {} as jest.Mocked<EntityManager>;

		mockDataSource = {
			createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
		} as unknown as jest.Mocked<DataSource>;

		repository = new EnrollmentsRepository(mockDataSource);

		jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('listAllEnrollmentsPaginated', () => {
		it('should return paginated enrollments with default pagination values', async () => {
			const result = await repository.listAllEnrollmentsPaginated({});

			expect(repository.createQueryBuilder).toHaveBeenCalledWith('enrollment');
			expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('enrollment.user', 'user');
			expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('enrollment.course_class', 'course_class');
			expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('course_class.course', 'course');
			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
			expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('enrollment.enrolled_at', 'DESC');
			expect(result).toEqual({
				data: mockEnrollments,
				page: 1,
				limit: 10,
				total: 2,
				total_pages: 1,
			});
		});

		it('should return paginated enrollments with custom pagination values', async () => {
			const result = await repository.listAllEnrollmentsPaginated({ page: 2, limit: 5 });

			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
			expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
			expect(result.page).toBe(2);
			expect(result.limit).toBe(5);
		});

		it('should filter by user_id when provided', async () => {
			const userId = '0194e7c5-8b7e-7000-8000-000000000002';

			await repository.listAllEnrollmentsPaginated({ user_id: userId });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('enrollment.user_id = :user_id', {
				user_id: userId,
			});
		});

		it('should filter by class_id when provided', async () => {
			const classId = '0194e7c5-8b7e-7000-8000-000000000003';

			await repository.listAllEnrollmentsPaginated({ class_id: classId });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('enrollment.class_id = :class_id', {
				class_id: classId,
			});
		});

		it('should filter by course_id when provided', async () => {
			const courseId = '0194e7c5-8b7e-7000-8000-000000000010';

			await repository.listAllEnrollmentsPaginated({ course_id: courseId });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course_class.course_id = :course_id', {
				course_id: courseId,
			});
		});

		it('should filter by search term in user name, course title and class title', async () => {
			await repository.listAllEnrollmentsPaginated({ search: 'João' });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				'(user.name ILIKE :search OR course.title ILIKE :search OR course_class.title ILIKE :search)',
				{ search: '%João%' },
			);
		});

		it('should not apply search filter when search is not provided', async () => {
			await repository.listAllEnrollmentsPaginated({});

			expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(expect.stringContaining('ILIKE :search'), expect.anything());
		});

		it('should not apply ID filters when not provided', async () => {
			await repository.listAllEnrollmentsPaginated({});

			expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
		});

		it('should apply all filters together', async () => {
			const userId = '0194e7c5-8b7e-7000-8000-000000000002';
			const classId = '0194e7c5-8b7e-7000-8000-000000000003';
			const courseId = '0194e7c5-8b7e-7000-8000-000000000010';

			await repository.listAllEnrollmentsPaginated({
				search: 'TypeScript',
				user_id: userId,
				class_id: classId,
				course_id: courseId,
			});

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(4);
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				'(user.name ILIKE :search OR course.title ILIKE :search OR course_class.title ILIKE :search)',
				{ search: '%TypeScript%' },
			);
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('enrollment.user_id = :user_id', {
				user_id: userId,
			});
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('enrollment.class_id = :class_id', {
				class_id: classId,
			});
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course_class.course_id = :course_id', {
				course_id: courseId,
			});
		});

		it('should calculate total pages correctly', async () => {
			mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockEnrollments, 25]);

			const result = await repository.listAllEnrollmentsPaginated({ page: 1, limit: 10 });

			expect(result.total_pages).toBe(3);
			expect(result.total).toBe(25);
		});

		it('should return empty data array when no enrollments found', async () => {
			mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

			const result = await repository.listAllEnrollmentsPaginated({});

			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
			expect(result.total_pages).toBe(0);
		});

		it('should calculate correct skip value for subsequent pages', async () => {
			await repository.listAllEnrollmentsPaginated({ page: 5, limit: 20 });

			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(80);
		});

		it('should order results by enrolled_at in descending order', async () => {
			await repository.listAllEnrollmentsPaginated({});

			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('enrollment.enrolled_at', 'DESC');
		});

		it('should include user relation in query', async () => {
			await repository.listAllEnrollmentsPaginated({});

			expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('enrollment.user', 'user');
		});

		it('should include course_class relation in query', async () => {
			await repository.listAllEnrollmentsPaginated({});

			expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('enrollment.course_class', 'course_class');
		});

		it('should include course relation through course_class', async () => {
			await repository.listAllEnrollmentsPaginated({});

			expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('course_class.course', 'course');
		});
	});
});
