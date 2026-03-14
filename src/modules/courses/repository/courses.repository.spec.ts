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

	const mockRaw = [
		{ available_classes_count: '3', closed_classes_count: '1' },
		{ available_classes_count: '2', closed_classes_count: '0' },
	];

	beforeEach(() => {
		mockQueryBuilder = {
			addSelect: jest.fn().mockReturnThis(),
			setParameters: jest.fn().mockReturnThis(),
			andWhere: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			skip: jest.fn().mockReturnThis(),
			take: jest.fn().mockReturnThis(),
			getCount: jest.fn().mockResolvedValue(mockCourses.length),
			getRawAndEntities: jest.fn().mockResolvedValue({ entities: mockCourses, raw: mockRaw }),
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
		it('should return paginated courses with class status counts', async () => {
			const result = await repository.listAllCoursesPaginated({});

			expect(repository.createQueryBuilder).toHaveBeenCalledWith('course');
			expect(mockQueryBuilder.getCount).toHaveBeenCalled();
			expect(mockQueryBuilder.addSelect).toHaveBeenCalledTimes(2);
			expect(mockQueryBuilder.setParameters).toHaveBeenCalledWith({
				availableStatus: CourseClassStatus.AVAILABLE,
				closedStatus: CourseClassStatus.CLOSED,
			});
			expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
			expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
			expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('course.created_at', 'DESC');
			expect(mockQueryBuilder.getRawAndEntities).toHaveBeenCalled();
			expect(result).toEqual({
				data: [
					{ ...mockCourses[0], classes_count: { available_classes_count: 3, closed_classes_count: 1 } },
					{ ...mockCourses[1], classes_count: { available_classes_count: 2, closed_classes_count: 0 } },
				],
				page: 1,
				limit: 10,
				total: 2,
				total_pages: 1,
			});
		});

		it('should add count subqueries after getCount to avoid state reset', async () => {
			const callOrder: string[] = [];
			mockQueryBuilder.getCount.mockImplementation(async () => {
				callOrder.push('getCount');
				return mockCourses.length;
			});
			mockQueryBuilder.addSelect.mockImplementation(() => {
				callOrder.push('addSelect');
				return mockQueryBuilder;
			});

			await repository.listAllCoursesPaginated({});

			const getCountIndex = callOrder.indexOf('getCount');
			const firstAddSelectIndex = callOrder.indexOf('addSelect');

			expect(getCountIndex).toBeLessThan(firstAddSelectIndex);
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

		it('should filter by status using EXISTS subquery', async () => {
			const courseClassStatus = [CourseClassStatus.AVAILABLE];

			await repository.listAllCoursesPaginated({ courseClassStatus });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				'EXISTS (SELECT 1 FROM classes c2 WHERE c2.course_id = course.id AND c2.status IN (:...courseClassStatus))',
				{ courseClassStatus },
			);
		});

		it('should filter by multiple statuses', async () => {
			const courseClassStatus = [CourseClassStatus.AVAILABLE, CourseClassStatus.CLOSED];

			await repository.listAllCoursesPaginated({ courseClassStatus });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				'EXISTS (SELECT 1 FROM classes c2 WHERE c2.course_id = course.id AND c2.status IN (:...courseClassStatus))',
				{ courseClassStatus },
			);
		});

		it('should not apply status filter when status array is empty', async () => {
			await repository.listAllCoursesPaginated({ courseClassStatus: [] });

			expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(expect.stringContaining('EXISTS'), expect.anything());
		});

		it('should apply all filters together', async () => {
			const search = 'curso';
			const themes = [CourseTheme.TECHNOLOGY];
			const courseClassStatus = [CourseClassStatus.AVAILABLE];

			await repository.listAllCoursesPaginated({ search, themes, courseClassStatus });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('(course.title ILIKE :search OR course.description ILIKE :search)', {
				search: '%curso%',
			});
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.themes && :themes', { themes });
			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
				'EXISTS (SELECT 1 FROM classes c2 WHERE c2.course_id = course.id AND c2.status IN (:...courseClassStatus))',
				{ courseClassStatus },
			);
		});

		it('should calculate total pages correctly', async () => {
			mockQueryBuilder.getCount.mockResolvedValueOnce(25);

			const result = await repository.listAllCoursesPaginated({ page: 1, limit: 10 });

			expect(result.total_pages).toBe(3);
			expect(result.total).toBe(25);
		});

		it('should return empty data array when no courses found', async () => {
			mockQueryBuilder.getCount.mockResolvedValueOnce(0);
			mockQueryBuilder.getRawAndEntities.mockResolvedValueOnce({ entities: [], raw: [] });

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

		it('should handle search with special characters', async () => {
			await repository.listAllCoursesPaginated({ search: 'c#' });

			expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('(course.title ILIKE :search OR course.description ILIKE :search)', { search: '%c#%' });
		});

		it('should map raw count values to numbers', async () => {
			mockQueryBuilder.getRawAndEntities.mockResolvedValueOnce({
				entities: [mockCourse],
				raw: [{ available_classes_count: '5', closed_classes_count: '10' }],
			});
			mockQueryBuilder.getCount.mockResolvedValueOnce(1);

			const result = await repository.listAllCoursesPaginated({});

			expect(result.data[0].classes_count.available_classes_count).toBe(5);
			expect(result.data[0].classes_count.closed_classes_count).toBe(10);
		});

		it('should default count values to zero when raw values are null', async () => {
			mockQueryBuilder.getRawAndEntities.mockResolvedValueOnce({
				entities: [mockCourse],
				raw: [{ available_classes_count: null, closed_classes_count: null }],
			});
			mockQueryBuilder.getCount.mockResolvedValueOnce(1);

			const result = await repository.listAllCoursesPaginated({});

			expect(result.data[0].classes_count.available_classes_count).toBe(0);
			expect(result.data[0].classes_count.closed_classes_count).toBe(0);
		});
	});
});
