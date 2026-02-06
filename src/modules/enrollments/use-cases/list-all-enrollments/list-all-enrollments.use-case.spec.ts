import { Test, type TestingModule } from '@nestjs/testing';
import type { PaginatedResponseDto } from '@/shared/dto/pagination.dto';
import type { ListAllEnrollmentsPaginationDto } from '../../models/dto/input/list-all-enrollments-pagination.dto';
import type { Enrollment } from '../../models/entities/enrollment.entity';
import type { EnrollmentsRepositoryInterface } from '../../models/interfaces/enrollments-repository.interface';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { ListAllEnrollmentsUseCase } from './list-all-enrollments.use-case';

describe('ListAllEnrollmentsUseCase', () => {
	let useCase: ListAllEnrollmentsUseCase;
	let mockEnrollmentsRepository: jest.Mocked<EnrollmentsRepositoryInterface>;

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

	const mockPaginatedResponse: PaginatedResponseDto<Enrollment> = {
		data: mockEnrollments,
		page: 1,
		limit: 10,
		total: 2,
		total_pages: 1,
	};

	beforeEach(async () => {
		mockEnrollmentsRepository = {
			findOne: jest.fn(),
			find: jest.fn(),
			save: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			listAllEnrollmentsPaginated: jest.fn(),
		} as unknown as jest.Mocked<EnrollmentsRepositoryInterface>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ListAllEnrollmentsUseCase,
				{
					provide: ENROLLMENT_REPOSITORY_INTERFACE_KEY,
					useValue: mockEnrollmentsRepository,
				},
			],
		}).compile();

		useCase = module.get<ListAllEnrollmentsUseCase>(ListAllEnrollmentsUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful listing', () => {
			beforeEach(() => {
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(mockPaginatedResponse);
			});

			it('should return paginated enrollments with default pagination', async () => {
				const paginationDto: ListAllEnrollmentsPaginationDto = {};

				const result = await useCase.execute(paginationDto);

				expect(mockEnrollmentsRepository.listAllEnrollmentsPaginated).toHaveBeenCalledWith(paginationDto);
				expect(result).toEqual(mockPaginatedResponse);
			});

			it('should return paginated enrollments with custom page and limit', async () => {
				const paginationDto: ListAllEnrollmentsPaginationDto = { page: 2, limit: 5 };
				const customResponse: PaginatedResponseDto<Enrollment> = {
					...mockPaginatedResponse,
					page: 2,
					limit: 5,
				};
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(customResponse);

				const result = await useCase.execute(paginationDto);

				expect(mockEnrollmentsRepository.listAllEnrollmentsPaginated).toHaveBeenCalledWith(paginationDto);
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

		describe('filtering by user_id', () => {
			it('should filter enrollments by user_id', async () => {
				const userId = '0194e7c5-8b7e-7000-8000-000000000002';
				const filteredResponse: PaginatedResponseDto<Enrollment> = {
					data: [mockEnrollment],
					page: 1,
					limit: 10,
					total: 1,
					total_pages: 1,
				};
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(filteredResponse);

				const paginationDto: ListAllEnrollmentsPaginationDto = { user_id: userId };
				const result = await useCase.execute(paginationDto);

				expect(mockEnrollmentsRepository.listAllEnrollmentsPaginated).toHaveBeenCalledWith({ user_id: userId });
				expect(result.data).toHaveLength(1);
				expect(result.data[0].user_id).toBe(userId);
			});
		});

		describe('filtering by class_id', () => {
			it('should filter enrollments by class_id', async () => {
				const classId = '0194e7c5-8b7e-7000-8000-000000000003';
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(mockPaginatedResponse);

				const paginationDto: ListAllEnrollmentsPaginationDto = { class_id: classId };
				const result = await useCase.execute(paginationDto);

				expect(mockEnrollmentsRepository.listAllEnrollmentsPaginated).toHaveBeenCalledWith({
					class_id: classId,
				});
				expect(result.data.every((e) => e.class_id === classId)).toBe(true);
			});
		});

		describe('filtering by course_id', () => {
			it('should filter enrollments by course_id', async () => {
				const courseId = '0194e7c5-8b7e-7000-8000-000000000010';
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(mockPaginatedResponse);

				const paginationDto: ListAllEnrollmentsPaginationDto = { course_id: courseId };
				const result = await useCase.execute(paginationDto);

				expect(mockEnrollmentsRepository.listAllEnrollmentsPaginated).toHaveBeenCalledWith({
					course_id: courseId,
				});
				expect(result).toEqual(mockPaginatedResponse);
			});
		});

		describe('combined filters', () => {
			it('should handle multiple filters together', async () => {
				const paginationDto: ListAllEnrollmentsPaginationDto = {
					user_id: '0194e7c5-8b7e-7000-8000-000000000002',
					class_id: '0194e7c5-8b7e-7000-8000-000000000003',
					page: 1,
					limit: 5,
				};
				const filteredResponse: PaginatedResponseDto<Enrollment> = {
					data: [mockEnrollment],
					page: 1,
					limit: 5,
					total: 1,
					total_pages: 1,
				};
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(filteredResponse);

				const result = await useCase.execute(paginationDto);

				expect(mockEnrollmentsRepository.listAllEnrollmentsPaginated).toHaveBeenCalledWith(paginationDto);
				expect(result).toEqual(filteredResponse);
			});

			it('should handle all filters with pagination', async () => {
				const paginationDto: ListAllEnrollmentsPaginationDto = {
					user_id: '0194e7c5-8b7e-7000-8000-000000000002',
					class_id: '0194e7c5-8b7e-7000-8000-000000000003',
					course_id: '0194e7c5-8b7e-7000-8000-000000000010',
					page: 2,
					limit: 10,
				};
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(mockPaginatedResponse);

				await useCase.execute(paginationDto);

				expect(mockEnrollmentsRepository.listAllEnrollmentsPaginated).toHaveBeenCalledWith(paginationDto);
			});
		});

		describe('empty results', () => {
			it('should return empty data array when no enrollments found', async () => {
				const emptyResponse: PaginatedResponseDto<Enrollment> = {
					data: [],
					page: 1,
					limit: 10,
					total: 0,
					total_pages: 0,
				};
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({});

				expect(result.data).toEqual([]);
				expect(result.total).toBe(0);
				expect(result.total_pages).toBe(0);
			});

			it('should return empty results for non-matching filters', async () => {
				const emptyResponse: PaginatedResponseDto<Enrollment> = {
					data: [],
					page: 1,
					limit: 10,
					total: 0,
					total_pages: 0,
				};
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({ user_id: 'non-existent-user-id' });

				expect(result.data).toEqual([]);
			});
		});

		describe('pagination edge cases', () => {
			it('should handle large page numbers', async () => {
				const emptyResponse: PaginatedResponseDto<Enrollment> = {
					data: [],
					page: 999,
					limit: 10,
					total: 2,
					total_pages: 1,
				};
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(emptyResponse);

				const result = await useCase.execute({ page: 999 });

				expect(mockEnrollmentsRepository.listAllEnrollmentsPaginated).toHaveBeenCalledWith({ page: 999 });
				expect(result.data).toEqual([]);
			});

			it('should handle limit of 1', async () => {
				const singleItemResponse: PaginatedResponseDto<Enrollment> = {
					data: [mockEnrollment],
					page: 1,
					limit: 1,
					total: 2,
					total_pages: 2,
				};
				mockEnrollmentsRepository.listAllEnrollmentsPaginated.mockResolvedValue(singleItemResponse);

				const result = await useCase.execute({ limit: 1 });

				expect(result.data).toHaveLength(1);
				expect(result.total_pages).toBe(2);
			});
		});
	});
});
