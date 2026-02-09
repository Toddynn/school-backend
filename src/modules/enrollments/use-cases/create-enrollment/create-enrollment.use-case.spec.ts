import { Test, type TestingModule } from '@nestjs/testing';
import type { CourseClass } from '@/modules/classes/models/entities/course-class.entity';
import { CourseClassStatus } from '@/modules/classes/shared/enums/course-class-status.enum';
import { GetExistingCourseClassUseCase } from '@/modules/classes/use-cases/get-existing-course-class/get-existing-class.use-case';
import { UpdateCourseClassSpotsUseCase } from '@/modules/classes/use-cases/update-course-class-spots/update-course-class-spots.use-case';
import { CourseClassFullException } from '../../errors/course-class-full.error';
import { CourseClassNotAvailableException } from '../../errors/course-class-not-available.error';
import { CourseClassOutOfRangeException } from '../../errors/course-class-out-of-range.error';
import { EnrollmentAlreadyExistsException } from '../../errors/enrollment-already-exists.error';
import { UserAlreadyEnrolledInCourseException } from '../../errors/user-already-enrolled-in-course.error';
import type { CreateEnrollmentDto } from '../../models/dto/input/create-enrollment.dto';
import type { Enrollment } from '../../models/entities/enrollment.entity';
import type { EnrollmentsRepositoryInterface } from '../../models/interfaces/enrollments-repository.interface';
import { ENROLLMENT_REPOSITORY_INTERFACE_KEY } from '../../shared/constants/repository-interface-key';
import { GetExistingEnrollmentUseCase } from '../get-existing-enrollment/get-existing-enrollment.use-case';
import { CreateEnrollmentUseCase } from './create-enrollment.use-case';

describe('CreateEnrollmentUseCase', () => {
	let useCase: CreateEnrollmentUseCase;
	let mockEnrollmentsRepository: jest.Mocked<EnrollmentsRepositoryInterface>;
	let mockGetExistingEnrollmentUseCase: jest.Mocked<GetExistingEnrollmentUseCase>;
	let mockGetExistingCourseClassUseCase: jest.Mocked<GetExistingCourseClassUseCase>;
	let mockUpdateCourseClassSpotsUseCase: jest.Mocked<UpdateCourseClassSpotsUseCase>;

	const now = new Date();
	const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
	const farFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

	const mockCourseClass: CourseClass = {
		id: '0194e7c5-8b7e-7000-8000-000000000001',
		title: 'Turma A',
		description: 'Descrição da turma',
		spots: 30,
		status: CourseClassStatus.AVAILABLE,
		start_date: pastDate,
		end_date: futureDate,
		course_id: '0194e7c5-8b7e-7000-8000-000000000010',
		course: {} as never,
		enrollments: [],
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as CourseClass;

	const mockEnrollment: Enrollment = {
		id: '0194e7c5-8b7e-7000-8000-000000000002',
		user_id: '0194e7c5-8b7e-7000-8000-000000000003',
		class_id: mockCourseClass.id,
		enrolled_at: new Date(),
		user: {} as never,
		course_class: mockCourseClass,
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
	} as unknown as Enrollment;

	const createEnrollmentDto: CreateEnrollmentDto = {
		user_id: '0194e7c5-8b7e-7000-8000-000000000003',
		class_id: mockCourseClass.id,
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

		mockGetExistingEnrollmentUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetExistingEnrollmentUseCase>;

		mockGetExistingCourseClassUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<GetExistingCourseClassUseCase>;

		mockUpdateCourseClassSpotsUseCase = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<UpdateCourseClassSpotsUseCase>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateEnrollmentUseCase,
				{
					provide: ENROLLMENT_REPOSITORY_INTERFACE_KEY,
					useValue: mockEnrollmentsRepository,
				},
				{
					provide: GetExistingEnrollmentUseCase,
					useValue: mockGetExistingEnrollmentUseCase,
				},
				{
					provide: GetExistingCourseClassUseCase,
					useValue: mockGetExistingCourseClassUseCase,
				},
				{
					provide: UpdateCourseClassSpotsUseCase,
					useValue: mockUpdateCourseClassSpotsUseCase,
				},
			],
		}).compile();

		useCase = module.get<CreateEnrollmentUseCase>(CreateEnrollmentUseCase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		describe('successful enrollment', () => {
			beforeEach(() => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(null);
				mockEnrollmentsRepository.create.mockReturnValue(mockEnrollment);
				mockEnrollmentsRepository.save.mockResolvedValue(mockEnrollment);
				mockUpdateCourseClassSpotsUseCase.execute.mockResolvedValue({ raw: [], affected: 1, generatedMaps: [] });
			});

			it('should create enrollment successfully when all conditions are met', async () => {
				const result = await useCase.execute(createEnrollmentDto);

				expect(mockGetExistingCourseClassUseCase.execute).toHaveBeenCalledWith(
					{ where: { id: createEnrollmentDto.class_id } },
					{ throwIfNotFound: true },
				);
				expect(mockEnrollmentsRepository.create).toHaveBeenCalledWith(createEnrollmentDto);
				expect(mockEnrollmentsRepository.save).toHaveBeenCalledWith(mockEnrollment);
				expect(result).toEqual(mockEnrollment);
			});

			it('should verify class exists before enrollment', async () => {
				await useCase.execute(createEnrollmentDto);

				expect(mockGetExistingCourseClassUseCase.execute).toHaveBeenCalledTimes(1);
			});

			it('should check for duplicate enrollment in same class', async () => {
				await useCase.execute(createEnrollmentDto);

				expect(mockGetExistingEnrollmentUseCase.execute).toHaveBeenCalledWith(
					{
						where: {
							user_id: createEnrollmentDto.user_id,
							class_id: createEnrollmentDto.class_id,
						},
					},
					{ throwIfFound: true },
				);
			});

			it('should check for existing enrollment in same course (different class)', async () => {
				await useCase.execute(createEnrollmentDto);

				expect(mockGetExistingEnrollmentUseCase.execute).toHaveBeenCalledWith(
					{
						where: {
							user_id: createEnrollmentDto.user_id,
							course_class: {
								course_id: mockCourseClass.course_id,
							},
						},
					},
					{ throwIfFound: false, throwIfNotFound: false },
				);
			});

			it('should decrement spots after successful enrollment', async () => {
				await useCase.execute(createEnrollmentDto);

				expect(mockUpdateCourseClassSpotsUseCase.execute).toHaveBeenCalledWith(createEnrollmentDto.class_id, 'decrement');
			});

			it('should decrement spots only after saving enrollment', async () => {
				let enrollmentSaved = false;
				mockEnrollmentsRepository.save.mockImplementation(async () => {
					enrollmentSaved = true;
					return mockEnrollment;
				});
				mockUpdateCourseClassSpotsUseCase.execute.mockImplementation(async () => {
					expect(enrollmentSaved).toBe(true);
					return { raw: [], affected: 1, generatedMaps: [] };
				});

				await useCase.execute(createEnrollmentDto);

				expect(mockUpdateCourseClassSpotsUseCase.execute).toHaveBeenCalled();
			});
		});

		describe('Regra A: status da turma deve ser "disponível"', () => {
			it('should throw CourseClassNotAvailableException when class status is CLOSED', async () => {
				const closedClass: CourseClass = {
					...mockCourseClass,
					status: CourseClassStatus.CLOSED,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(closedClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassNotAvailableException);
			});

			it('should throw CourseClassNotAvailableException with correct message', async () => {
				const closedClass: CourseClass = {
					...mockCourseClass,
					status: CourseClassStatus.CLOSED,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(closedClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow('A turma não está disponível para matrícula');
			});

			it('should not call repository create when class is not available', async () => {
				const closedClass: CourseClass = {
					...mockCourseClass,
					status: CourseClassStatus.CLOSED,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(closedClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow();

				expect(mockEnrollmentsRepository.create).not.toHaveBeenCalled();
				expect(mockEnrollmentsRepository.save).not.toHaveBeenCalled();
			});
		});

		describe('Regra D: turma deve ter vagas disponíveis', () => {
			it('should throw CourseClassFullException when spots is 0', async () => {
				const classWithNoSpots: CourseClass = {
					...mockCourseClass,
					spots: 0,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithNoSpots);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassFullException);
			});

			it('should throw CourseClassFullException when spots is negative', async () => {
				const classWithNegativeSpots: CourseClass = {
					...mockCourseClass,
					spots: -1,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithNegativeSpots);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassFullException);
			});

			it('should throw CourseClassFullException with correct message', async () => {
				const classWithNoSpots: CourseClass = {
					...mockCourseClass,
					spots: 0,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithNoSpots);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow('A turma não possui mais vagas disponíveis');
			});

			it('should not call repository when class has no spots', async () => {
				const classWithNoSpots: CourseClass = {
					...mockCourseClass,
					spots: 0,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithNoSpots);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow();

				expect(mockEnrollmentsRepository.create).not.toHaveBeenCalled();
				expect(mockEnrollmentsRepository.save).not.toHaveBeenCalled();
				expect(mockUpdateCourseClassSpotsUseCase.execute).not.toHaveBeenCalled();
			});

			it('should allow enrollment when spots is 1 (last spot)', async () => {
				const classWithLastSpot: CourseClass = {
					...mockCourseClass,
					spots: 1,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithLastSpot);
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(null);
				mockEnrollmentsRepository.create.mockReturnValue(mockEnrollment);
				mockEnrollmentsRepository.save.mockResolvedValue(mockEnrollment);
				mockUpdateCourseClassSpotsUseCase.execute.mockResolvedValue({ raw: [], affected: 1, generatedMaps: [] });

				const result = await useCase.execute(createEnrollmentDto);

				expect(result).toEqual(mockEnrollment);
				expect(mockUpdateCourseClassSpotsUseCase.execute).toHaveBeenCalledWith(createEnrollmentDto.class_id, 'decrement');
			});

			it('should allow enrollment when class has many spots', async () => {
				const classWithManySpots: CourseClass = {
					...mockCourseClass,
					spots: 100,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(classWithManySpots);
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(null);
				mockEnrollmentsRepository.create.mockReturnValue(mockEnrollment);
				mockEnrollmentsRepository.save.mockResolvedValue(mockEnrollment);
				mockUpdateCourseClassSpotsUseCase.execute.mockResolvedValue({ raw: [], affected: 1, generatedMaps: [] });

				const result = await useCase.execute(createEnrollmentDto);

				expect(result).toEqual(mockEnrollment);
			});
		});

		describe('Regra B: data atual deve estar entre início e fim da turma', () => {
			it('should throw CourseClassOutOfRangeException when current date is before start_date', async () => {
				const futureStartClass: CourseClass = {
					...mockCourseClass,
					start_date: futureDate,
					end_date: farFutureDate,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(futureStartClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassOutOfRangeException);
			});

			it('should throw CourseClassOutOfRangeException when current date is after end_date', async () => {
				const expiredClass: CourseClass = {
					...mockCourseClass,
					start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
					end_date: pastDate,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(expiredClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassOutOfRangeException);
			});

			it('should throw CourseClassOutOfRangeException with correct message', async () => {
				const expiredClass: CourseClass = {
					...mockCourseClass,
					start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
					end_date: pastDate,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(expiredClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow('A turma está fora do prazo de matrícula');
			});

			it('should not call repository when class is out of date range', async () => {
				const expiredClass: CourseClass = {
					...mockCourseClass,
					start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
					end_date: pastDate,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(expiredClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow();

				expect(mockEnrollmentsRepository.create).not.toHaveBeenCalled();
				expect(mockEnrollmentsRepository.save).not.toHaveBeenCalled();
			});

			it('should allow enrollment when current date is exactly at start_date boundary', async () => {
				const boundaryClass: CourseClass = {
					...mockCourseClass,
					start_date: new Date(now.getTime() - 1000),
					end_date: futureDate,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(boundaryClass);
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(null);
				mockEnrollmentsRepository.create.mockReturnValue(mockEnrollment);
				mockEnrollmentsRepository.save.mockResolvedValue(mockEnrollment);

				const result = await useCase.execute(createEnrollmentDto);

				expect(result).toEqual(mockEnrollment);
			});
		});

		describe('Regra C: usuário não pode se matricular em mais de uma turma do mesmo curso', () => {
			it('should throw UserAlreadyEnrolledInCourseException when user is already enrolled in another class of same course', async () => {
				const existingEnrollmentInSameCourse: Enrollment = {
					...mockEnrollment,
					class_id: '0194e7c5-8b7e-7000-8000-different-class',
				} as unknown as Enrollment;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValueOnce(null).mockResolvedValueOnce(existingEnrollmentInSameCourse);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(UserAlreadyEnrolledInCourseException);
			});

			it('should throw UserAlreadyEnrolledInCourseException with correct message', async () => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValueOnce(null).mockResolvedValueOnce(mockEnrollment);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow('Usuário já está matriculado em uma turma deste curso');
			});

			it('should not create enrollment when user is already enrolled in course', async () => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValueOnce(null).mockResolvedValueOnce(mockEnrollment);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow();

				expect(mockEnrollmentsRepository.create).not.toHaveBeenCalled();
				expect(mockEnrollmentsRepository.save).not.toHaveBeenCalled();
			});

			it('should allow enrollment in different courses', async () => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockGetExistingEnrollmentUseCase.execute.mockResolvedValue(null);
				mockEnrollmentsRepository.create.mockReturnValue(mockEnrollment);
				mockEnrollmentsRepository.save.mockResolvedValue(mockEnrollment);

				const result = await useCase.execute(createEnrollmentDto);

				expect(result).toEqual(mockEnrollment);
			});
		});

		describe('duplicate enrollment in same class', () => {
			it('should throw EnrollmentAlreadyExistsException when user is already enrolled in same class', async () => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockGetExistingEnrollmentUseCase.execute.mockRejectedValueOnce(new EnrollmentAlreadyExistsException());

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(EnrollmentAlreadyExistsException);
			});

			it('should not create enrollment when duplicate exists', async () => {
				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(mockCourseClass);
				mockGetExistingEnrollmentUseCase.execute.mockRejectedValueOnce(new EnrollmentAlreadyExistsException());

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow();

				expect(mockEnrollmentsRepository.create).not.toHaveBeenCalled();
				expect(mockEnrollmentsRepository.save).not.toHaveBeenCalled();
			});
		});

		describe('validation order', () => {
			it('should check class availability before checking enrollment duplicates', async () => {
				const closedClass: CourseClass = {
					...mockCourseClass,
					status: CourseClassStatus.CLOSED,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(closedClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassNotAvailableException);

				expect(mockGetExistingEnrollmentUseCase.execute).not.toHaveBeenCalled();
			});

			it('should check date range before checking enrollment duplicates', async () => {
				const expiredClass: CourseClass = {
					...mockCourseClass,
					start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
					end_date: pastDate,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(expiredClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassOutOfRangeException);

				expect(mockGetExistingEnrollmentUseCase.execute).not.toHaveBeenCalled();
			});

			it('should check spots availability before checking enrollment duplicates', async () => {
				const fullClass: CourseClass = {
					...mockCourseClass,
					spots: 0,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(fullClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassFullException);

				expect(mockGetExistingEnrollmentUseCase.execute).not.toHaveBeenCalled();
			});

			it('should check status before date range', async () => {
				const closedExpiredClass: CourseClass = {
					...mockCourseClass,
					status: CourseClassStatus.CLOSED,
					start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
					end_date: pastDate,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(closedExpiredClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassNotAvailableException);
			});

			it('should check date range before spots', async () => {
				const expiredFullClass: CourseClass = {
					...mockCourseClass,
					spots: 0,
					start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
					end_date: pastDate,
				} as unknown as CourseClass;

				mockGetExistingCourseClassUseCase.execute.mockResolvedValue(expiredFullClass);

				await expect(useCase.execute(createEnrollmentDto)).rejects.toThrow(CourseClassOutOfRangeException);
			});
		});
	});
});
