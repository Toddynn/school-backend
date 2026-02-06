import { Test, type TestingModule } from '@nestjs/testing';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllClassesPaginationDto } from '../../models/dto/input/list-all-classes-pagination.dto';
import type { CourseClass } from '../../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseClassStatus } from '../../shared/enums/course-class-status.enum';
import { ListAllClassesUseCase } from './list-all-classes.use-case';

describe('ListAllClassesUseCase', () => {
	let useCase: ListAllClassesUseCase;
	let mockCourseClassesRepository: jest.Mocked<CourseClassesRepositoryInterface>;

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

	const mockPaginatedResponse: PaginatedResponseDto<CourseClass> = {
		data: mockCourseClasses,
		page: 1,
		limit: 10,
		total: 2,
		total_pages: 1,
	};

	beforeEach(async () => {
		mockCourseClassesRepository = {
			findOne: jest.fn(),
			find: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			listAllClassesPaginated: jest.fn(),
		} as unknown as jest.Mocked<CourseClassesRepositoryInterface>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ListAllClassesUseCase,
				{
					provide: COURSE_CLASSES_REPOSITORY_INTERFACE_KEY,
					useValue: mockCourseClassesRepository,
				},
			],
		}).compile();

		useCase = module.get<ListAllClassesUseCase>(ListAllClassesUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		beforeEach(() => {
			mockCourseClassesRepository.listAllClassesPaginated.mockResolvedValue(mockPaginatedResponse);
		});

		describe('pagination', () => {
			it('should return paginated classes with default values', async () => {
				const paginationDto: ListAllClassesPaginationDto = {};

				const result = await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith(paginationDto);
				expect(result).toEqual(mockPaginatedResponse);
			});

			it('should pass custom pagination parameters to repository', async () => {
				const paginationDto: ListAllClassesPaginationDto = {
					page: 2,
					limit: 5,
				};

				await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith({
					page: 2,
					limit: 5,
				});
			});

			it('should return correct pagination metadata', async () => {
				const paginationDto: ListAllClassesPaginationDto = {};

				const result = await useCase.execute(paginationDto);

				expect(result.page).toBe(1);
				expect(result.limit).toBe(10);
				expect(result.total).toBe(2);
				expect(result.total_pages).toBe(1);
			});
		});

		describe('filters', () => {
			it('should pass search filter to repository', async () => {
				const paginationDto: ListAllClassesPaginationDto = {
					search: 'turma',
				};

				await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith({
					search: 'turma',
				});
			});

			it('should pass course_id filter to repository', async () => {
				const paginationDto: ListAllClassesPaginationDto = {
					course_id: '0194e7c5-8b7e-7000-8000-000000000010',
				};

				await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith({
					course_id: '0194e7c5-8b7e-7000-8000-000000000010',
				});
			});

			it('should pass single status filter to repository', async () => {
				const paginationDto: ListAllClassesPaginationDto = {
					status: [CourseClassStatus.AVAILABLE],
				};

				await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith({
					status: [CourseClassStatus.AVAILABLE],
				});
			});

			it('should pass multiple status filters to repository', async () => {
				const paginationDto: ListAllClassesPaginationDto = {
					status: [CourseClassStatus.AVAILABLE, CourseClassStatus.CLOSED],
				};

				await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith({
					status: [CourseClassStatus.AVAILABLE, CourseClassStatus.CLOSED],
				});
			});

			it('should pass start_date filter to repository', async () => {
				const startDate = new Date('2024-03-01');
				const paginationDto: ListAllClassesPaginationDto = {
					start_date: startDate,
				};

				await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith({
					start_date: startDate,
				});
			});

			it('should pass end_date filter to repository', async () => {
				const endDate = new Date('2024-12-31');
				const paginationDto: ListAllClassesPaginationDto = {
					end_date: endDate,
				};

				await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith({
					end_date: endDate,
				});
			});

			it('should pass all filters combined to repository', async () => {
				const startDate = new Date('2024-01-01');
				const endDate = new Date('2024-12-31');
				const paginationDto: ListAllClassesPaginationDto = {
					page: 1,
					limit: 10,
					search: 'turma',
					course_id: '0194e7c5-8b7e-7000-8000-000000000010',
					status: [CourseClassStatus.AVAILABLE],
					start_date: startDate,
					end_date: endDate,
				};

				await useCase.execute(paginationDto);

				expect(mockCourseClassesRepository.listAllClassesPaginated).toHaveBeenCalledWith(paginationDto);
			});
		});

		describe('empty results', () => {
			it('should return empty data array when no classes found', async () => {
				const emptyResponse: PaginatedResponseDto<CourseClass> = {
					data: [],
					page: 1,
					limit: 10,
					total: 0,
					total_pages: 0,
				};
				mockCourseClassesRepository.listAllClassesPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({});

				expect(result.data).toEqual([]);
				expect(result.total).toBe(0);
			});
		});

		describe('data return', () => {
			it('should return classes with all properties', async () => {
				const result = await useCase.execute({});

				expect(result.data).toHaveLength(2);
				expect(result.data[0]).toHaveProperty('id');
				expect(result.data[0]).toHaveProperty('title');
				expect(result.data[0]).toHaveProperty('description');
				expect(result.data[0]).toHaveProperty('spots');
				expect(result.data[0]).toHaveProperty('status');
				expect(result.data[0]).toHaveProperty('start_date');
				expect(result.data[0]).toHaveProperty('end_date');
				expect(result.data[0]).toHaveProperty('course_id');
			});

			it('should return classes with correct status values', async () => {
				const result = await useCase.execute({});

				expect(result.data[0].status).toBe(CourseClassStatus.AVAILABLE);
				expect(result.data[1].status).toBe(CourseClassStatus.CLOSED);
			});
		});
	});
});
