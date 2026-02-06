import { Test, type TestingModule } from '@nestjs/testing';
import { CourseClassStatus } from '@/modules/classes/shared/enums/course-class-status.enum';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllCoursesPaginationDto } from '../../models/dto/input/list-all-courses-pagination.dto';
import type { Course } from '../../models/entities/course.entity';
import type { CoursesRepositoryInterface } from '../../models/interfaces/courses-repository.interface';
import { COURSE_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseTheme } from '../../shared/enums/course-theme.enum';
import { ListAllCoursesUseCase } from './list-all-courses.use-case';

describe('ListAllCoursesUseCase', () => {
	let useCase: ListAllCoursesUseCase;
	let mockCoursesRepository: jest.Mocked<CoursesRepositoryInterface>;

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

	const mockPaginatedResponse: PaginatedResponseDto<Course> = {
		data: mockCourses,
		page: 1,
		limit: 10,
		total: 2,
		total_pages: 1,
	};

	beforeEach(async () => {
		mockCoursesRepository = {
			findOne: jest.fn(),
			find: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			listAllCoursesPaginated: jest.fn(),
		} as unknown as jest.Mocked<CoursesRepositoryInterface>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ListAllCoursesUseCase,
				{
					provide: COURSE_REPOSITORY_INTERFACE_KEY,
					useValue: mockCoursesRepository,
				},
			],
		}).compile();

		useCase = module.get<ListAllCoursesUseCase>(ListAllCoursesUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful listing', () => {
			beforeEach(() => {
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);
			});

			it('should return paginated courses with default pagination', async () => {
				const paginationDto: ListAllCoursesPaginationDto = {};

				const result = await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith(paginationDto);
				expect(result).toEqual(mockPaginatedResponse);
			});

			it('should return paginated courses with custom page and limit', async () => {
				const paginationDto: ListAllCoursesPaginationDto = { page: 2, limit: 5 };
				const customResponse: PaginatedResponseDto<Course> = {
					...mockPaginatedResponse,
					page: 2,
					limit: 5,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(customResponse);

				const result = await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith(paginationDto);
				expect(result.page).toBe(2);
				expect(result.limit).toBe(5);
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

		describe('filtering by search (title/description)', () => {
			it('should filter courses by title through search parameter', async () => {
				const filteredResponse: PaginatedResponseDto<Course> = {
					data: [mockCourse],
					page: 1,
					limit: 10,
					total: 1,
					total_pages: 1,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(filteredResponse);

				const paginationDto: ListAllCoursesPaginationDto = { search: 'TypeScript' };
				const result = await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({ search: 'TypeScript' });
				expect(result.data).toHaveLength(1);
				expect(result.data[0].title).toContain('TypeScript');
			});

			it('should filter courses by description through search parameter', async () => {
				const filteredResponse: PaginatedResponseDto<Course> = {
					data: [mockCourse],
					page: 1,
					limit: 10,
					total: 1,
					total_pages: 1,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(filteredResponse);

				const result = await useCase.execute({ search: 'avançado' });

				expect(result.data).toHaveLength(1);
			});

			it('should return empty results for non-matching search', async () => {
				const emptyResponse: PaginatedResponseDto<Course> = {
					data: [],
					page: 1,
					limit: 10,
					total: 0,
					total_pages: 0,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({ search: 'nonexistent' });

				expect(result.data).toEqual([]);
			});
		});

		describe('filtering by themes', () => {
			it('should filter courses by single theme', async () => {
				const filteredResponse: PaginatedResponseDto<Course> = {
					data: [mockCourse],
					page: 1,
					limit: 10,
					total: 1,
					total_pages: 1,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(filteredResponse);

				const paginationDto: ListAllCoursesPaginationDto = { themes: [CourseTheme.TECHNOLOGY] };
				const result = await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({
					themes: [CourseTheme.TECHNOLOGY],
				});
				expect(result.data).toHaveLength(1);
			});

			it('should filter courses by multiple themes', async () => {
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				const paginationDto: ListAllCoursesPaginationDto = {
					themes: [CourseTheme.TECHNOLOGY, CourseTheme.MARKETING],
				};
				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({
					themes: [CourseTheme.TECHNOLOGY, CourseTheme.MARKETING],
				});
			});

			it('should filter by INNOVATION theme', async () => {
				const paginationDto: ListAllCoursesPaginationDto = { themes: [CourseTheme.INNOVATION] };
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({
					themes: [CourseTheme.INNOVATION],
				});
			});

			it('should filter by ENTREPRENEURSHIP theme', async () => {
				const paginationDto: ListAllCoursesPaginationDto = { themes: [CourseTheme.ENTREPRENEURSHIP] };
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({
					themes: [CourseTheme.ENTREPRENEURSHIP],
				});
			});

			it('should filter by AGRICULTURE theme', async () => {
				const paginationDto: ListAllCoursesPaginationDto = { themes: [CourseTheme.AGRICULTURE] };
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({
					themes: [CourseTheme.AGRICULTURE],
				});
			});

			it('should return empty results for theme with no courses', async () => {
				const emptyResponse: PaginatedResponseDto<Course> = {
					data: [],
					page: 1,
					limit: 10,
					total: 0,
					total_pages: 0,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({ themes: [CourseTheme.AGRICULTURE] });

				expect(result.data).toEqual([]);
			});
		});

		describe('filtering by status', () => {
			it('should filter courses by class status AVAILABLE', async () => {
				const paginationDto: ListAllCoursesPaginationDto = { status: [CourseClassStatus.AVAILABLE] };
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({
					status: [CourseClassStatus.AVAILABLE],
				});
			});

			it('should filter courses by class status CLOSED', async () => {
				const paginationDto: ListAllCoursesPaginationDto = { status: [CourseClassStatus.CLOSED] };
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({
					status: [CourseClassStatus.CLOSED],
				});
			});

			it('should filter courses by multiple statuses', async () => {
				const paginationDto: ListAllCoursesPaginationDto = {
					status: [CourseClassStatus.AVAILABLE, CourseClassStatus.CLOSED],
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({
					status: [CourseClassStatus.AVAILABLE, CourseClassStatus.CLOSED],
				});
			});
		});

		describe('combined filters', () => {
			it('should handle search and themes together', async () => {
				const paginationDto: ListAllCoursesPaginationDto = {
					search: 'TypeScript',
					themes: [CourseTheme.TECHNOLOGY],
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith(paginationDto);
			});

			it('should handle all filters with pagination', async () => {
				const paginationDto: ListAllCoursesPaginationDto = {
					search: 'Curso',
					themes: [CourseTheme.TECHNOLOGY, CourseTheme.INNOVATION],
					status: [CourseClassStatus.AVAILABLE],
					page: 2,
					limit: 5,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith(paginationDto);
			});
		});

		describe('empty results', () => {
			it('should return empty data array when no courses found', async () => {
				const emptyResponse: PaginatedResponseDto<Course> = {
					data: [],
					page: 1,
					limit: 10,
					total: 0,
					total_pages: 0,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({});

				expect(result.data).toEqual([]);
				expect(result.total).toBe(0);
				expect(result.total_pages).toBe(0);
			});
		});

		describe('pagination edge cases', () => {
			it('should handle large page numbers', async () => {
				const emptyResponse: PaginatedResponseDto<Course> = {
					data: [],
					page: 999,
					limit: 10,
					total: 2,
					total_pages: 1,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({ page: 999 });

				expect(mockCoursesRepository.listAllCoursesPaginated).toHaveBeenCalledWith({ page: 999 });
				expect(result.data).toEqual([]);
			});

			it('should handle limit of 1', async () => {
				const singleItemResponse: PaginatedResponseDto<Course> = {
					data: [mockCourse],
					page: 1,
					limit: 1,
					total: 2,
					total_pages: 2,
				};
				mockCoursesRepository.listAllCoursesPaginated.mockResolvedValue(singleItemResponse);

				const result = await useCase.execute({ limit: 1 });

				expect(result.data).toHaveLength(1);
				expect(result.total_pages).toBe(2);
			});
		});
	});
});
