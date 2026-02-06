import type { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import { CourseClassStatus } from '@/modules/classes/shared/enums/course-class-status.enum';
import type { Course } from '../models/entities/course.entity';
import { CourseTheme } from '../shared/enums/course-theme.enum';
import { CoursesRepository } from './courses.repository';

describe('CoursesRepository', () => {
	let repository: CoursesRepository;
	let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Course>>;
	let mockDataSource: jest.Mocked<DataSource>;
	let mockEntityManager: jest.Mocked<EntityManager>;

	const mockCourse: Course = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		title: 'Curso de TypeScript',
		description: 'Aprenda TypeScript do zero ao avançado',
		image_url: 'https://example.com/typescript.png',
		themes: [CourseTheme.TECHNOLOGY, CourseTheme.INNOVATION],
		classes: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as Course;

	const mockCourses: Course[] = [
		mockCourse,
		{
			id: '0194e7c5-8b7e-7000-8000-000000000002',
			title: 'Curso de Marketing Digital',
			description: 'Domine o marketing digital',
			image_url: 'https://example.com/marketing.png',
			themes: [CourseTheme.MARKETING, CourseTheme.ENTREPRENEURSHIP],
			classes: [],
			created_at: new Date('2024-01-02'),
			updated_at: new Date('2024-01-02'),
		} as unknown as Course,
	];

	beforeEach(() => {
		mockQueryBuilder = {
			leftJoin: jest.fn().mockReturnThis(),
			andWhere: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			take: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			getManyAndCount: jest.fn().mockResolvedValue([mockCourses, mockCourses.length]),
		} as unknown as jest.Mocked<SelectQueryBuilder<Course>>;

		mockEntityManager = {} as jest.Mocked<EntityManager>;

		mockDataSource = {
			createEntityManager: jest.fn().mockReturnValue(mockEntityManager),
		} as unknown as jest.Mocked<DataSource>;

		repository = new CoursesRepository(mockDataSource);

		jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('listAllCoursesPaginated', () => {
		it('should return paginated courses with default pagination values', async () => {
			const result = await repository.listAllCoursesPaginated({});

			expect(repository.createQueryBuilder).toHaveBeenCalledWith('course');
			expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('course.classes', 'classes');
			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
			expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('course.created_at', 'DESC');
			expect(result).toEqual({
				data: mockCourses,
				page: 1,
				limit: 10,
				total: 2,
				total_pages: 1,
			});
		});

		it('should return paginated courses with custom pagination values', async () => {
			const result = await repository.listAllCoursesPaginated({ page: 2, limit: 5 });

			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
			expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
			expect(result.page).toBe(2);
			expect(result.limit).toBe(5);
		});

		it('should apply search filter when search term is provided', async () => {
			await repository.listAllCoursesPaginated({ search: 'typescript' });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('(course.title ILIKE :search OR course.description ILIKE :search)', {
				search: '%typescript%',
			});
		});

		it('should not apply search filter when search term is not provided', async () => {
			await repository.listAllCoursesPaginated({});

			expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(expect.stringContaining('ILIKE :search'), expect.anything());
		});

		it('should filter by themes when themes array is provided', async () => {
			const themes = [CourseTheme.TECHNOLOGY, CourseTheme.INNOVATION];

			await repository.listAllCoursesPaginated({ themes });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.themes && :themes', { themes });
		});

		it('should filter by single theme', async () => {
			const themes = [CourseTheme.MARKETING];

			await repository.listAllCoursesPaginated({ themes });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.themes && :themes', { themes });
		});

		it('should not apply themes filter when themes array is empty', async () => {
			await repository.listAllCoursesPaginated({ themes: [] });

			expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('course.themes && :themes', expect.anything());
		});

		it('should not apply themes filter when themes is undefined', async () => {
			await repository.listAllCoursesPaginated({});

			expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('course.themes && :themes', expect.anything());
		});

		it('should filter by status when status array is provided', async () => {
			const status = [CourseClassStatus.AVAILABLE];

			await repository.listAllCoursesPaginated({ status });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('classes.status IN (:...status)', { status });
		});

		it('should filter by multiple statuses', async () => {
			const status = [CourseClassStatus.AVAILABLE, CourseClassStatus.CLOSED];

			await repository.listAllCoursesPaginated({ status });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('classes.status IN (:...status)', { status });
		});

		it('should not apply status filter when status array is empty', async () => {
			await repository.listAllCoursesPaginated({ status: [] });

			expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('classes.status IN (:...status)', expect.anything());
		});

		it('should apply all filters together', async () => {
			const search = 'curso';
			const themes = [CourseTheme.TECHNOLOGY];
			const status = [CourseClassStatus.AVAILABLE];

			await repository.listAllCoursesPaginated({ search, themes, status });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('(course.title ILIKE :search OR course.description ILIKE :search)', {
				search: '%curso%',
			});
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.themes && :themes', { themes });
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('classes.status IN (:...status)', { status });
		});

		it('should calculate total pages correctly', async () => {
			mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([mockCourses, 25]);

			const result = await repository.listAllCoursesPaginated({ page: 1, limit: 10 });

			expect(result.total_pages).toBe(3);
			expect(result.total).toBe(25);
		});

		it('should return empty data array when no courses found', async () => {
			mockQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

			const result = await repository.listAllCoursesPaginated({});

			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
			expect(result.total_pages).toBe(0);
		});

		it('should calculate correct skip value for subsequent pages', async () => {
			await repository.listAllCoursesPaginated({ page: 5, limit: 20 });

			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(80);
		});

		it('should order results by created_at in descending order', async () => {
			await repository.listAllCoursesPaginated({});

			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('course.created_at', 'DESC');
		});

		it('should join with classes relation', async () => {
			await repository.listAllCoursesPaginated({});

			expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('course.classes', 'classes');
		});

		it('should handle search with special characters', async () => {
			await repository.listAllCoursesPaginated({ search: 'c#' });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('(course.title ILIKE :search OR course.description ILIKE :search)', { search: '%c#%' });
		});
	});
});
