import { Test, type TestingModule } from '@nestjs/testing';
import type { DataSource, SelectQueryBuilder } from 'typeorm';
import type { CourseClass } from '../models/entities/course-class.entity';
import { CourseClassStatus } from '../shared/enums/course-class-status.enum';
import { CourseClassesRepository } from './course-classes.repository';

describe('CourseClassesRepository', () => {
	let repository: CourseClassesRepository;
	let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<CourseClass>>;

	const mockCourseClasses: CourseClass[] = [
		{
			id: '0194e7c5-8b7e-7000-8000-000000000001',
			title: 'Turma A',
			description: 'Descrição da Turma A',
			spots: 30,
			status: CourseClassStatus.AVAILABLE,
			start_date: new Date('2024-01-01'),
			end_date: new Date('2024-06-30'),
			course_id: '0194e7c5-8b7e-7000-8000-000000000010',
			course: {} as never,
			enrollments: [],
			created_at: new Date('2024-01-01'),
			updated_at: new Date('2024-01-01'),
		} as unknown as CourseClass,
		{
			id: '0194e7c5-8b7e-7000-8000-000000000002',
			title: 'Turma B',
			description: 'Descrição da Turma B',
			spots: 25,
			status: CourseClassStatus.CLOSED,
			start_date: new Date('2024-03-01'),
			end_date: new Date('2024-08-31'),
			course_id: '0194e7c5-8b7e-7000-8000-000000000011',
			course: {} as never,
			enrollments: [],
			created_at: new Date('2024-01-02'),
			updated_at: new Date('2024-01-02'),
		} as unknown as CourseClass,
	];

	beforeEach(async () => {
		mockQueryBuilder = {
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			andWhere: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			take: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([mockCourseClasses, mockCourseClasses.length]),
		} as unknown as jest.Mocked<SelectQueryBuilder<CourseClass>>;

		const mockDataSource = {
			createEntityManager: jest.fn().mockReturnValue({}),
		} as unknown as DataSource;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: CourseClassesRepository,
					useFactory: () => {
						const repo = new CourseClassesRepository(mockDataSource);
						jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
						return repo;
					},
				},
			],
		}).compile();

		repository = module.get<CourseClassesRepository>(CourseClassesRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('listAllClassesPaginated', () => {
		describe('pagination', () => {
			it('should return paginated results with default values', async () => {
				const result = await repository.listAllClassesPaginated({});

				expect(result).toEqual({
					data: mockCourseClasses,
					page: 1,
					limit: 10,
					total: 2,
					total_pages: 1,
				});
			});

			it('should apply custom pagination parameters', async () => {
				await repository.listAllClassesPaginated({ page: 2, limit: 5 });

				expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
				expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
			});

			it('should calculate total_pages correctly', async () => {
				mockQueryBuilder.getManyAndCount.mockResolvedValue([mockCourseClasses, 25]);

				const result = await repository.listAllClassesPaginated({ limit: 10 });

				expect(result.total_pages).toBe(3);
			});

			it('should calculate skip correctly for page 3 with limit 10', async () => {
				await repository.listAllClassesPaginated({ page: 3, limit: 10 });

				expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
			});

			it('should order by created_at DESC', async () => {
				await repository.listAllClassesPaginated({});

				expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('class.created_at', 'DESC');
			});
		});

		describe('joins', () => {
			it('should join with course relation', async () => {
				await repository.listAllClassesPaginated({});

				expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('class.course', 'course');
			});
		});

		describe('filters', () => {
			it('should filter by course_id when provided', async () => {
				const courseId = '0194e7c5-8b7e-7000-8000-000000000010';

				await repository.listAllClassesPaginated({ course_id: courseId });

				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.course_id = :course_id', {
					course_id: courseId,
				});
			});

			it('should not filter by course_id when not provided', async () => {
				await repository.listAllClassesPaginated({});

				expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('class.course_id = :course_id', expect.anything());
			});

			it('should filter by search term in title and description', async () => {
				await repository.listAllClassesPaginated({ search: 'turma' });

				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('(class.title ILIKE :search OR class.description ILIKE :search)', {
					search: '%turma%',
				});
			});

			it('should not filter by search when not provided', async () => {
				await repository.listAllClassesPaginated({});

				expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
					'(class.title ILIKE :search OR class.description ILIKE :search)',
					expect.anything(),
				);
			});

			it('should filter by single status', async () => {
				await repository.listAllClassesPaginated({ status: [CourseClassStatus.AVAILABLE] });

				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.status IN (:...status)', {
					status: [CourseClassStatus.AVAILABLE],
				});
			});

			it('should filter by multiple statuses', async () => {
				await repository.listAllClassesPaginated({
					status: [CourseClassStatus.AVAILABLE, CourseClassStatus.CLOSED],
				});

				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.status IN (:...status)', {
					status: [CourseClassStatus.AVAILABLE, CourseClassStatus.CLOSED],
				});
			});

			it('should not filter by status when not provided', async () => {
				await repository.listAllClassesPaginated({});

				expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('class.status IN (:...status)', expect.anything());
			});

			it('should not filter by status when empty array', async () => {
				await repository.listAllClassesPaginated({ status: [] });

				expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('class.status IN (:...status)', expect.anything());
			});

			it('should filter by start_date when provided', async () => {
				const startDate = new Date('2024-03-01');

				await repository.listAllClassesPaginated({ start_date: startDate });

				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.start_date >= :start_date', {
					start_date: startDate,
				});
			});

			it('should not filter by start_date when not provided', async () => {
				await repository.listAllClassesPaginated({});

				expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('class.start_date >= :start_date', expect.anything());
			});

			it('should filter by end_date when provided', async () => {
				const endDate = new Date('2024-12-31');

				await repository.listAllClassesPaginated({ end_date: endDate });

				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.end_date <= :end_date', {
					end_date: endDate,
				});
			});

			it('should not filter by end_date when not provided', async () => {
				await repository.listAllClassesPaginated({});

				expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('class.end_date <= :end_date', expect.anything());
			});

			it('should apply all filters together', async () => {
				const courseId = '0194e7c5-8b7e-7000-8000-000000000010';
				const startDate = new Date('2024-01-01');
				const endDate = new Date('2024-12-31');

				await repository.listAllClassesPaginated({
					course_id: courseId,
					search: 'turma',
					status: [CourseClassStatus.AVAILABLE],
					start_date: startDate,
					end_date: endDate,
				});

				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.course_id = :course_id', {
					course_id: courseId,
				});
				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('(class.title ILIKE :search OR class.description ILIKE :search)', {
					search: '%turma%',
				});
				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.status IN (:...status)', {
					status: [CourseClassStatus.AVAILABLE],
				});
				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.start_date >= :start_date', {
					start_date: startDate,
				});
				expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('class.end_date <= :end_date', {
					end_date: endDate,
				});
			});
		});

		describe('empty results', () => {
			it('should return empty data array when no results found', async () => {
				mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

				const result = await repository.listAllClassesPaginated({});

				expect(result.data).toEqual([]);
				expect(result.total).toBe(0);
				expect(result.total_pages).toBe(0);
			});
		});
	});
});
