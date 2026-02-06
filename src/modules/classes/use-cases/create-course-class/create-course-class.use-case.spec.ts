import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundCourseException } from '@/modules/courses/errors/not-found-course.error';
import { GetExistingCourseUseCase } from '@/modules/courses/use-cases/get-existing-course/get-existing-course.use-case';
import type { CreateCourseClassDto } from '../../models/dto/input/create-course-class.dto';
import type { CourseClass } from '../../models/entities/course-class.entity';
import type { CourseClassesRepositoryInterface } from '../../models/interfaces/course-classes-repository.interface';
import { COURSE_CLASSES_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { CourseClassStatus } from '../../shared/enums/course-class-status.enum';
import { CreateCourseClassUseCase } from './create-course-class.use-case';

describe('CreateCourseClassUseCase', () => {
	let useCase: CreateCourseClassUseCase;
	let mockCourseClassesRepository: jest.Mocked<CourseClassesRepositoryInterface>;
	let mockGetExistingCourseUseCase: jest.Mocked<GetExistingCourseUseCase>;

	const mockCourseClass: CourseClass = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		title: 'Turma A',
		description: 'Descrição da turma',
		spots: 30,
		status: CourseClassStatus.AVAILABLE,
		start_date: new Date('2024-01-01'),
		end_date: new Date('2024-06-30'),
		course_id: '0194e7c5-8b7e-7000-8000-000000000010',
		course: {} as never,
		enrollments: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as CourseClass;

	const createCourseClassDto: CreateCourseClassDto = {
		title: 'Turma A',
		description: 'Descrição da turma',
		spots: 30,
		status: CourseClassStatus.AVAILABLE,
		start_date: new Date('2024-01-01'),
		end_date: new Date('2024-06-30'),
		course_id: '0194e7c5-8b7e-7000-8000-000000000010',
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

		mockGetExistingCourseUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetExistingCourseUseCase>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateCourseClassUseCase,
				{
					provide: COURSE_CLASSES_REPOSITORY_INTERFACE_KEY,
					useValue: mockCourseClassesRepository,
				},
				{
					provide: GetExistingCourseUseCase,
					useValue: mockGetExistingCourseUseCase,
				},
			],
		}).compile();

		useCase = module.get<CreateCourseClassUseCase>(CreateCourseClassUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful creation', () => {
			beforeEach(() => {
				mockGetExistingCourseUseCase.execute.mockResolvedValue({} as never);
				mockCourseClassesRepository.create.mockReturnValue(mockCourseClass);
				mockCourseClassesRepository.save.mockResolvedValue(mockCourseClass);
			});

			it('should create a course class successfully', async () => {
				const result = await useCase.execute(createCourseClassDto);

				expect(mockGetExistingCourseUseCase.execute).toHaveBeenCalledWith(
					{ where: { id: createCourseClassDto.course_id } },
					{ throwIfNotFound: true },
				);
				expect(mockCourseClassesRepository.create).toHaveBeenCalledWith(createCourseClassDto);
				expect(mockCourseClassesRepository.save).toHaveBeenCalledWith(mockCourseClass);
				expect(result).toEqual(mockCourseClass);
			});

			it('should verify course exists before creating class', async () => {
				await useCase.execute(createCourseClassDto);

				const courseCheckOrder = mockGetExistingCourseUseCase.execute.mock.invocationCallOrder[0];
				const createOrder = mockCourseClassesRepository.create.mock.invocationCallOrder[0];

				expect(courseCheckOrder).toBeLessThan(createOrder);
			});

			it('should create class with default status AVAILABLE when not provided', async () => {
				const dtoWithoutStatus: CreateCourseClassDto = {
					...createCourseClassDto,
					status: undefined,
				};

				await useCase.execute(dtoWithoutStatus);

				expect(mockCourseClassesRepository.create).toHaveBeenCalledWith(dtoWithoutStatus);
			});

			it('should create class with CLOSED status when provided', async () => {
				const dtoWithClosedStatus: CreateCourseClassDto = {
					...createCourseClassDto,
					status: CourseClassStatus.CLOSED,
				};

				await useCase.execute(dtoWithClosedStatus);

				expect(mockCourseClassesRepository.create).toHaveBeenCalledWith(dtoWithClosedStatus);
			});

			it('should return the saved class entity', async () => {
				const result = await useCase.execute(createCourseClassDto);

				expect(result).toBe(mockCourseClass);
			});
		});

		describe('course not found', () => {
			it('should throw NotFoundCourseException when course does not exist', async () => {
				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${createCourseClassDto.course_id}`));

				await expect(useCase.execute(createCourseClassDto)).rejects.toThrow(NotFoundCourseException);
			});

			it('should include course_id in error message', async () => {
				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${createCourseClassDto.course_id}`));

				await expect(useCase.execute(createCourseClassDto)).rejects.toThrow(
					`Curso não encontrado com os critérios: id: ${createCourseClassDto.course_id}`,
				);
			});

			it('should not create class when course is not found', async () => {
				mockGetExistingCourseUseCase.execute.mockRejectedValue(new NotFoundCourseException(`id: ${createCourseClassDto.course_id}`));

				await expect(useCase.execute(createCourseClassDto)).rejects.toThrow();

				expect(mockCourseClassesRepository.create).not.toHaveBeenCalled();
				expect(mockCourseClassesRepository.save).not.toHaveBeenCalled();
			});
		});

		describe('edge cases', () => {
			beforeEach(() => {
				mockGetExistingCourseUseCase.execute.mockResolvedValue({} as never);
				mockCourseClassesRepository.create.mockReturnValue(mockCourseClass);
				mockCourseClassesRepository.save.mockResolvedValue(mockCourseClass);
			});

			it('should handle class with minimum spots (1)', async () => {
				const dtoWithMinSpots: CreateCourseClassDto = {
					...createCourseClassDto,
					spots: 1,
				};

				await useCase.execute(dtoWithMinSpots);

				expect(mockCourseClassesRepository.create).toHaveBeenCalledWith(dtoWithMinSpots);
			});

			it('should handle class with high number of spots', async () => {
				const dtoWithHighSpots: CreateCourseClassDto = {
					...createCourseClassDto,
					spots: 1000,
				};

				await useCase.execute(dtoWithHighSpots);

				expect(mockCourseClassesRepository.create).toHaveBeenCalledWith(dtoWithHighSpots);
			});

			it('should handle class with same start and end date', async () => {
				const sameDate = new Date('2024-06-15');
				const dtoWithSameDate: CreateCourseClassDto = {
					...createCourseClassDto,
					start_date: sameDate,
					end_date: sameDate,
				};

				await useCase.execute(dtoWithSameDate);

				expect(mockCourseClassesRepository.create).toHaveBeenCalledWith(dtoWithSameDate);
			});
		});
	});
});
